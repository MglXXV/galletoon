import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import path, { dirname } from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import "dotenv/config";
import Stripe from "stripe";
import { connect } from "./mongoSchema/database.ts";
import Category from "./mongoSchema/manga/categorySchema.ts";
import Manga from "./mongoSchema/manga/mangaSchema.ts";
import Chapter from "./mongoSchema/manga/chapterSchema.ts";
import User from "./mongoSchema/user/userSchema.ts";
import multer from "multer";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { execSync } from "child_process";
import Gallecoins from "./mongoSchema/user/gallecoinsSchema.ts";
import BuyGallecoinsModel from "./mongoSchema/stripe/buyGallecoinsSchema.ts";
import Library from "./mongoSchema/user/librarySchema.ts";
import BuyChaptersModel from "./mongoSchema/stripe/buyChaptersSchema.ts";
import dotenv from "dotenv";
dotenv.config();

declare module "fastify" {
  interface FastifyRequest {
    rawBody?: string;
  }
}

//STRIPE URL
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const MONGO_URI = process.env.MONGO_URI as string;

const fastify = Fastify({
  logger: true,
});

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

fastify.register(fastifyCookie);

fastify.register(fastifySession, {
  secret: process.env.SESSION_KEY as string,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 86400000,
    sameSite: "lax",
  },
  saveUninitialized: false,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// Middleware para verificar autenticación: USER
const requireAuth = async (request: any, reply: any) => {
  try {
    const sessionToken = request.session?.sessionId;

    // Opción alternativa: permitir token en header Authorization
    const bearerHeader = request.headers.authorization;
    const tokenFromHeader = bearerHeader?.startsWith("Bearer ")
      ? bearerHeader.slice(7)
      : null;

    const tokenToVerify = sessionToken || tokenFromHeader;

    if (!tokenToVerify) {
      return reply.status(401).send({
        success: false,
        error: "No autorizado - Token no proporcionado",
        redirectTo: "/api/auth/login",
      });
    }

    // Verificar sesión en base de datos
    const user = await User.findOne({
      sessionToken: tokenToVerify,
      activeSession: true,
    });

    if (!user) {
      if (request.session) {
        await request.session.destroy();
      }
      return reply.status(401).send({
        success: false,
        error: "Sesión inválida o expirada",
        redirectTo: "/api/auth/login",
      });
    }

    // Actualizar información de usuario en la sesión
    (request.session as any).user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      gallecoins: user.galleCoins,
      activeSession: user.activeSession,
    };

    // Opcional: Actualizar última actividad
    await User.updateOne(
      { _id: user._id },
      { $set: { lastActivityAt: new Date() } },
    );
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    return reply.status(500).send({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// Middleware para verificar autenticación: admin

const requireAdmin = async (request: any, reply: any) => {
  try {
    const sessionUser = (request.session as any)?.user;

    // Verificar que hay sesión activa
    if (!sessionUser || !sessionUser._id) {
      return reply.redirect("/");
    }

    // Verificar que la sesión sigue siendo válida en la base de datos
    const user = await User.findById(sessionUser._id);
    if (!user || !user.activeSession) {
      // Destruir sesión local si no es válida
      if (request.session) {
        await request.session.destroy();
      }
      return reply.status(401).send({
        success: false,
        error: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        redirectTo: "/api/auth/login",
      });
    }

    // Verificar que el usuario tiene rol de administrador
    if (user.role !== "admin") {
      return reply.status(403).send({
        success: false,
        error:
          "Acceso denegado. No tienes permisos de administrador para acceder a esta página.",
        redirectTo: "/",
      });
    }

    // Actualizar información de usuario en la sesión si es necesario
    if (sessionUser.role !== user.role) {
      (request.session as any).user.role = user.role;
    }
  } catch (error) {
    console.error("Error en middleware de admin:", error);
    return reply.status(500).send({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

const mangaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(
      __dirname,
      "public",
      "uploads",
      "manga-covers",
    );
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "manga-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const mangaUpload = multer({
  storage: mangaStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"));
    }
  },
});

// Configuración de multer para subida de PDFs de capítulos
const chapterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public", "uploads", "chapters");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "chapter-" + uniqueSuffix + ".pdf");
  },
});

const chapterUpload = multer({
  storage: chapterStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB para PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
});

// Función para contar páginas de PDF usando pdfinfo (más simple y confiable)
async function countPDFPages(filePath: string): Promise<number> {
  // Validación inicial del archivo
  if (!fs.existsSync(filePath)) {
    console.error("Archivo PDF no encontrado:", filePath);
    return 0;
  }

  const fileStats = fs.statSync(filePath);
  if (fileStats.size === 0) {
    console.error("Archivo PDF vacío:", filePath);
    return 0;
  }

  // Método 1: Usando pdf-lib (puro JavaScript)
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();

    if (pageCount > 0) {
      console.log(`[pdf-lib] Páginas detectadas: ${pageCount}`);
      return pageCount;
    }
  } catch (error) {
    console.error("Error con pdf-lib:", error);
    // Continuamos con el siguiente método
  }

  // Método 2: Usando pdfinfo (requiere poppler-utils)
  try {
    if (process.platform !== "win32") {
      const pdfInfo = execSync(`pdfinfo "${filePath}"`).toString();
      const pagesMatch = pdfInfo.match(/Pages:\s+(\d+)/i);

      if (pagesMatch && pagesMatch[1]) {
        const pageCount = parseInt(pagesMatch[1], 10);
        console.log(`[pdfinfo] Páginas detectadas: ${pageCount}`);
        return pageCount;
      }
    }
  } catch (error) {
    console.error("Error con pdfinfo:", error);
    // Continuamos con el siguiente método
  }

  // Método 3: Análisis binario (último recurso)
  try {
    const data = fs.readFileSync(filePath);
    const count = (data.toString().match(/\/Type\s*\/Page[^s]/g) || []).length;

    if (count > 0) {
      console.log(`[análisis binario] Páginas detectadas: ${count}`);
      return count;
    }

    // Verificación de estructura básica de PDF
    const header = data.slice(0, 5).toString();
    const footer = data.slice(-6).toString();

    if (!header.startsWith("%PDF-") || !footer.includes("%%EOF")) {
      console.error("Archivo no es un PDF válido:", filePath);
      return 0;
    }

    // Si llegamos aquí, es un PDF pero no pudimos contar las páginas
    console.warn("PDF válido pero no se pudo determinar el número de páginas");
    return 0;
  } catch (error) {
    console.error("Error en análisis binario:", error);
    return 0;
  }
}

// Registrar multipart con Fastify
fastify.register(import("@fastify/multipart"));

// Registrar soporte para JSON
fastify.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  fastify.getDefaultJsonParser("ignore", "ignore"),
);

// Rutas principales
fastify.get("/", async (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/api/users", async (request, reply) => {
  try {
    const users = await User.find({}, "-password").lean();
    return reply.send({ success: true, data: users });
  } catch (err) {
    fastify.log.error(err);
    return reply
      .code(500)
      .send({ success: false, error: "Error al obtener usuarios" });
  }
});

// Obtener un usuario por ID
fastify.get("/api/users/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const user = await User.findById(id, "-password").lean();
    if (!user) {
      return reply
        .code(404)
        .send({ success: false, error: "Usuario no encontrado" });
    }
    return reply.send({ success: true, data: user });
  } catch (err) {
    fastify.log.error(err);
    return reply
      .code(500)
      .send({ success: false, error: "Error al obtener usuario" });
  }
});

fastify.get("/api/transactions", async (request, reply) => {
  try {
    // Listar los últimos 50 cargos
    const charges = await stripe.charges.list({ limit: 50 });
    // Formatear objetos para el front-end
    const data = charges.data.map((charge) => ({
      id: charge.id,
      created: charge.created,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      items: charge.metadata.items || [],
      customer: charge.customer,
      customer_email: charge.billing_details?.email || null,
    }));
    return reply.send({ success: true, data });
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({
      success: false,
      error: "Error al obtener transacciones de Stripe",
    });
  }
});

// Rutas para páginas independientes
fastify.get("/api/admin", { preHandler: requireAdmin }, async (req, res) => {
  return res.sendFile("admin.html");
});

fastify.get(
  "/api/admin/stats",
  { preHandler: requireAdmin },
  async (req, reply) => {
    try {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 6);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 1) Totales
      const totalUsers = await User.countDocuments({});
      const totalMangas = await Manga.countDocuments({});

      // 2) Transacciones hoy (número de compras)
      const transactionsToday = await BuyGallecoinsModel.countDocuments({
        date: { $gte: todayStart },
      });

      // Función helper para sumar "amount" en un rango
      const sumAmount = async (gteDate: Date) => {
        const res = await BuyGallecoinsModel.aggregate([
          { $match: { date: { $gte: gteDate } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return res[0]?.total || 0;
      };

      const revenueToday = await sumAmount(todayStart);
      const revenueWeek = await sumAmount(weekStart);
      const revenueMonth = await sumAmount(monthStart);

      reply.send({
        success: true,
        data: {
          totalUsers,
          totalMangas,
          transactionsToday,
          revenueToday,
          revenueWeek,
          revenueMonth,
        },
      });
    } catch (err) {
      req.log.error(err);
      reply
        .status(500)
        .send({ success: false, error: "Error al obtener estadísticas" });
    }
  },
);

fastify.get("/api/gallecoins", async (req, res) => {
  return res.sendFile("gallecoins.html");
});

fastify.get("/api/gallecoins/get", async (req, res) => {
  try {
    const coins = await Gallecoins.find().lean();
    res.send({ success: true, data: coins });
  } catch (err) {
    res
      .status(500)
      .send({ success: false, message: "Error al obtener monedas" });
  }
});

fastify.get("/api/profile", async (req, res) => {
  return res.sendFile("profile.html");
});

fastify.get("/api/categorias", async (req, res) => {
  return res.sendFile("category.html");
});

// Rutas adicionales para archivos estáticos
fastify.get("/app.js", async (req, res) => {
  return res.sendFile("app.js");
});

// API Routes para categorías
fastify.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ categoryName: 1 });
    return res.send({ success: true, data: categories });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, error: "Error al obtener categorías" });
  }
});

fastify.get("/api/mangas/byCategory/:categories", async (req, res) => {
  try {
    const { categories } = req.params as { categories: string };

    const mangas = await Manga.find({ categories: categories });

    if (!mangas || mangas.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No se encontraron mangas para esta categoría.",
      });
    }

    return res.send({ success: true, data: mangas });
  } catch (error) {
    console.error("Error al obtener mangas por categoría:", error);
    return res
      .status(500)
      .send({ success: false, error: "Error interno del servidor" });
  }
});

fastify.post(
  "/api/categories",
  { preHandler: requireAdmin },
  async (req, res) => {
    try {
      const { categoryName, description } = req.body as {
        categoryName: string;
        description: string;
      };

      if (!categoryName || !description) {
        return res.status(400).send({
          success: false,
          error: "Nombre y descripción son requeridos",
        });
      }

      // Verificar si la categoría ya existe
      const existingCategory = await Category.findOne({
        categoryName: { $regex: new RegExp(categoryName, "i") },
      });
      if (existingCategory) {
        return res.status(400).send({
          success: false,
          error: "Ya existe una categoría con ese nombre",
        });
      }

      const newCategory = new Category({
        categoryName: categoryName.trim(),
        description: description.trim(),
      });

      await newCategory.save();
      return res.send({ success: true, data: newCategory });
    } catch (error) {
      return res
        .status(500)
        .send({ success: false, error: "Error al crear categoría" });
    }
  },
);

fastify.put(
  "/api/categories/:id",
  { preHandler: requireAdmin },
  async (req, res) => {
    try {
      const { id } = req.params as { id: string };
      const { categoryName, description } = req.body as {
        categoryName: string;
        description: string;
      };

      if (!categoryName || !description) {
        return res.status(400).send({
          success: false,
          error: "Nombre y descripción son requeridos",
        });
      }

      // Verificar si otra categoría ya tiene ese nombre
      const existingCategory = await Category.findOne({
        categoryName: { $regex: new RegExp(categoryName, "i") },
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).send({
          success: false,
          error: "Ya existe una categoría con ese nombre",
        });
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { categoryName: categoryName.trim(), description: description.trim() },
        { new: true },
      );

      if (!updatedCategory) {
        return res
          .status(404)
          .send({ success: false, error: "Categoría no encontrada" });
      }

      return res.send({ success: true, data: updatedCategory });
    } catch (error) {
      return res
        .status(500)
        .send({ success: false, error: "Error al actualizar categoría" });
    }
  },
);

fastify.delete(
  "/api/categories/:id",
  { preHandler: requireAdmin },
  async (req, res) => {
    try {
      const { id } = req.params as { id: string };

      const deletedCategory = await Category.findByIdAndDelete(id);

      if (!deletedCategory) {
        return res
          .status(404)
          .send({ success: false, error: "Categoría no encontrada" });
      }

      return res.send({
        success: true,
        message: "Categoría eliminada correctamente",
      });
    } catch (error) {
      return res
        .status(500)
        .send({ success: false, error: "Error al eliminar categoría" });
    }
  },
);

// API Routes para mangas
fastify.get("/api/mangas", async (req, res) => {
  try {
    const mangas = await Manga.find({}).sort({ createdAt: -1 });

    // Para cada manga, obtener el conteo de capítulos
    const mangasWithChapters = await Promise.all(
      mangas.map(async (manga) => {
        const chapterCount = await Chapter.countDocuments({
          mangaId: manga._id,
        });
        return {
          ...manga.toObject(),
          chapterCount,
        };
      }),
    );

    return res.send({ success: true, data: mangasWithChapters });
  } catch (error) {
    console.error("Error al obtener mangas:", error);
    return res
      .status(500)
      .send({ success: false, error: "Error al obtener mangas" });
  }
});

fastify.get(
  "/api/mangas/:id",
  { preHandler: requireAdmin },
  async (req, res) => {
    try {
      const { id } = req.params as { id: string };
      const manga = await Manga.findById(id);

      if (!manga) {
        return res
          .status(404)
          .send({ success: false, error: "Manga no encontrado" });
      }

      const chapterCount = await Chapter.countDocuments({ mangaId: manga._id });
      const chapters = await Chapter.find({ mangaId: manga._id }).sort({
        chapterNumber: 1,
      });

      return res.send({
        success: true,
        data: {
          ...manga.toObject(),
          chapterCount,
          chapters,
        },
      });
    } catch (error) {
      console.error("Error al obtener manga:", error);
      return res
        .status(500)
        .send({ success: false, error: "Error al obtener manga" });
    }
  },
);

fastify.post("/api/mangas", { preHandler: requireAdmin }, async (req, res) => {
  try {
    const data = await req.file();
    let imageURL = "";
    let mangaData: any = {};

    if (data) {
      // Si hay archivo de imagen
      if (data.fieldname === "image") {
        const buffer = await data.toBuffer();
        const filename = `manga-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(data.filename)}`;
        const filepath = path.join(
          __dirname,
          "public",
          "uploads",
          "manga-covers",
          filename,
        );

        fs.writeFileSync(filepath, buffer);
        imageURL = `/uploads/manga-covers/${filename}`;
      }

      // Procesar otros campos del formulario
      const fields = data.fields;
      if (fields) {
        for (const [key, field] of Object.entries(fields)) {
          if (field && typeof field === "object" && "value" in field) {
            mangaData[key] = field.value;
          }
        }
      }
    } else {
      // Si no hay archivo, obtener datos del body
      mangaData = req.body as any;
    }

    const { title, description, genre, author, categories, status } = mangaData;

    if (!title || !description || !genre) {
      return res.status(400).send({
        success: false,
        error: "Título, descripción y categoría son requeridos",
      });
    }

    // Verificar si ya existe un manga con ese título
    const existingManga = await Manga.findOne({
      title: { $regex: new RegExp(title, "i") },
    });
    if (existingManga) {
      return res.status(400).send({
        success: false,
        error: "Ya existe un manga con ese título",
      });
    }

    const newManga = new Manga({
      title: title.trim(),
      description: description.trim(),
      imageURL,
      genre: genre.trim(),
      author: author?.trim() || "",
      categories: [genre.trim()], // Usar la categoría seleccionada
      status: status?.trim(),
      chapters: 0,
    });

    await newManga.save();
    return res.send({ success: true, data: newManga });
  } catch (error) {
    console.error("Error al crear manga:", error);
    return res
      .status(500)
      .send({ success: false, error: "Error al crear manga" });
  }
});

fastify.put(
  "/api/mangas/:id",
  { preHandler: requireAdmin },
  async (req, res) => {
    try {
      const { id } = req.params as { id: string };
      const data = await req.file();
      let imageURL = "";
      let mangaData: any = {};

      if (data) {
        // Si hay archivo de imagen
        if (data.fieldname === "image") {
          const buffer = await data.toBuffer();
          const filename = `manga-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(data.filename)}`;
          const filepath = path.join(
            __dirname,
            "public",
            "uploads",
            "manga-covers",
            filename,
          );

          // Eliminar imagen anterior si existe
          const existingManga = await Manga.findById(id);
          if (existingManga?.imageURL) {
            const oldImagePath = path.join(
              __dirname,
              "public",
              existingManga.imageURL,
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          fs.writeFileSync(filepath, buffer);
          imageURL = `/uploads/manga-covers/${filename}`;
        }

        // Procesar otros campos del formulario
        const fields = data.fields;
        if (fields) {
          for (const [key, field] of Object.entries(fields)) {
            if (field && typeof field === "object" && "value" in field) {
              mangaData[key] = field.value;
            }
          }
        }
      } else {
        // Si no hay archivo, obtener datos del body
        mangaData = req.body as any;
      }

      const { title, description, genre, author, categories, status } =
        mangaData;

      if (!title || !description || !genre) {
        return res.status(400).send({
          success: false,
          error: "Título, descripción y categoría son requeridos",
        });
      }

      // Verificar si otro manga ya tiene ese título
      const existingManga = await Manga.findOne({
        title: { $regex: new RegExp(title, "i") },
        _id: { $ne: id },
      });
      if (existingManga) {
        return res.status(400).send({
          success: false,
          error: "Ya existe un manga con ese título",
        });
      }

      const updateData: any = {
        title: title.trim(),
        description: description.trim(),
        genre: genre.trim(),
        author: author?.trim() || "",
        categories: [genre.trim()], // Usar la categoría seleccionada
        status: status || "ongoing",
      };

      if (imageURL) {
        updateData.imageURL = imageURL;
      }

      const updatedManga = await Manga.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedManga) {
        return res
          .status(404)
          .send({ success: false, error: "Manga no encontrado" });
      }

      return res.send({ success: true, data: updatedManga });
    } catch (error) {
      console.error("Error al actualizar manga:", error);
      return res
        .status(500)
        .send({ success: false, error: "Error al actualizar manga" });
    }
  },
);

fastify.delete(
  "/api/mangas/:id",
  { preHandler: requireAdmin },
  async (req, res) => {
    try {
      const { id } = req.params as { id: string };

      const manga = await Manga.findById(id);
      if (!manga) {
        return res
          .status(404)
          .send({ success: false, error: "Manga no encontrado" });
      }

      // Eliminar capítulos asociados
      await Chapter.deleteMany({ mangaId: id });

      // Eliminar imagen de portada si existe
      if (manga.imageURL) {
        const imagePath = path.join(__dirname, "public", manga.imageURL);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Manga.findByIdAndDelete(id);

      return res.send({
        success: true,
        message: "Manga eliminado correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar manga:", error);
      return res
        .status(500)
        .send({ success: false, error: "Error al eliminar manga" });
    }
  },
);

// API Routes para capítulos
fastify.get("/api/mangas/:mangaId/chapters", async (req, res) => {
  try {
    const { mangaId } = req.params as { mangaId: string };
    const chapters = await Chapter.find({ mangaId }).sort({ chapterNumber: 1 });

    return res.send({ success: true, data: chapters });
  } catch (error) {
    console.error("Error al obtener capítulos:", error);
    return res
      .status(500)
      .send({ success: false, error: "Error al obtener capítulos" });
  }
});

fastify.get("/api/mangas/search", async (request, reply) => {
  const { q } = request.query as { q?: string };

  // Si no hay query, devolvemos todos los mangas (igual que /api/mangas)
  if (!q || q.trim().length === 0) {
    const allMangas = await Manga.find({}).sort({ createdAt: -1 });
    const mangasConCapítulos = await Promise.all(
      allMangas.map(async (manga) => {
        const chapterCount = await Chapter.countDocuments({
          mangaId: manga._id,
        });
        return { ...manga.toObject(), chapterCount };
      }),
    );
    return reply.send({ success: true, mangas: mangasConCapítulos });
  }

  const regex = new RegExp(q.trim(), "i");
  try {
    const resultados = await Manga.find({
      $or: [
        { title: regex },
        { description: regex },
        { author: regex },
        { genre: regex },
      ],
    }).sort({ createdAt: -1 });

    // Si no encontró ninguno, redirige a "/"
    if (resultados.length === 0) {
      return reply.redirect("/");
    }

    const mangasConCapítulos = await Promise.all(
      resultados.map(async (manga) => {
        const chapterCount = await Chapter.countDocuments({
          mangaId: manga._id,
        });
        return { ...manga.toObject(), chapterCount };
      }),
    );

    return reply.send({ success: true, mangas: mangasConCapítulos });
  } catch (err) {
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: "Error interno al buscar mangas" });
  }
});

fastify.post("/api/mangas/:mangaId/chapters", async (req, res) => {
  try {
    const { mangaId } = req.params as { mangaId: string };
    const data = await req.file(); // soporta multipart
    let pdfPath = "";
    let pageCount = 0;
    let chapterData: any = {};

    // Función para validar y contar páginas del PDF
    const processPdfFile = async (filePath: string) => {
      if (!fs.existsSync(filePath)) {
        throw new Error("El archivo PDF no existe");
      }

      const count = await countPDFPages(filePath);
      if (count === 0) {
        fs.unlinkSync(filePath);
        throw new Error("El archivo PDF no es válido o está dañado");
      }
      return count;
    };

    // Procesamiento de datos (multipart o JSON)
    if (data) {
      // Procesar archivo PDF si viene en multipart
      if (data.fieldname === "pdf") {
        try {
          const buffer = await data.toBuffer();
          const filename = `chapter-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
          const filepath = path.join(
            __dirname,
            "public",
            "uploads",
            "chapters",
            filename,
          );

          // Crear directorio si no existe
          const uploadDir = path.dirname(filepath);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          await fs.promises.writeFile(filepath, buffer);
          pdfPath = `/uploads/chapters/${filename}`;
          pageCount = await processPdfFile(filepath);
        } catch (fileError) {
          console.error("Error procesando archivo PDF:", fileError);
          return res.status(400).send({
            success: false,
            error:
              fileError instanceof Error
                ? fileError.message
                : "Error al procesar el archivo PDF",
          });
        }
      }

      // Procesar campos adicionales del multipart
      const fields = (data as any).fields;
      if (fields) {
        for (const [key, field] of Object.entries(fields)) {
          if (field && typeof field === "object" && "value" in field) {
            chapterData[key] = field.value;
          }
        }
      }
    } else {
      // Procesar como JSON normal
      chapterData = req.body;
    }

    // Manejar pdfPath si se proporciona manualmente (en multipart o JSON)
    if (!pdfPath && chapterData.pdfPath) {
      const manualPath = chapterData.pdfPath.startsWith("/")
        ? chapterData.pdfPath
        : `/${chapterData.pdfPath}`;

      const absolutePath = path.join(__dirname, "public", manualPath);

      try {
        pageCount = await processPdfFile(absolutePath);
        pdfPath = manualPath;
      } catch (error) {
        console.warn("Error con PDF proporcionado:", error);
        return res.status(400).send({
          success: false,
          error: "La ruta del PDF proporcionada no es válida",
        });
      }
    }

    // Validar campos requeridos
    const { chapterNumber, chapterTitle, description, price } = chapterData;
    const requiredFields = [
      { field: chapterNumber, name: "chapterNumber" },
      { field: chapterTitle, name: "chapterTitle" },
      { field: price, name: "price" },
      { field: pdfPath, name: "PDF" },
    ];

    const missingFields = requiredFields.filter((f) => !f.field);
    if (missingFields.length > 0) {
      return res.status(400).send({
        success: false,
        error: `Campos requeridos faltantes: ${missingFields.map((f) => f.name).join(", ")}`,
        missingFields: missingFields.map((f) => f.name),
      });
    }

    // Validar manga existente
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res.status(404).send({
        success: false,
        error: "Manga no encontrado",
      });
    }

    // Validar capítulo duplicado
    const existingChapter = await Chapter.findOne({
      mangaId,
      chapterNumber: parseInt(chapterNumber as string),
    });
    if (existingChapter) {
      return res.status(400).send({
        success: false,
        error: "Ya existe un capítulo con ese número",
        existingChapterId: existingChapter._id,
      });
    }

    // Crear nuevo capítulo
    const newChapter = new Chapter({
      mangaId,
      chapterNumber: parseInt(chapterNumber as string),
      chapterTitle: chapterTitle.trim(),
      description: description?.trim() || "",
      price: Math.max(0, parseFloat(price as string)),
      chapterURL: pdfPath,
      pagesCount: pageCount,
      isPublished: true,
      publishDate: new Date(),
    });

    await newChapter.save();

    // Actualizar contador de capítulos en el manga
    const chapterCount = await Chapter.countDocuments({ mangaId });
    await Manga.findByIdAndUpdate(mangaId, { chapters: chapterCount });

    return res.status(201).send({
      success: true,
      data: {
        ...newChapter.toObject(),
        // Asegurar que la URL sea accesible
        fullChapterUrl: `${req.protocol}://${req.hostname}${pdfPath}`,
      },
    });
  } catch (error) {
    console.error("Error al crear capítulo:", error);
    return res.status(500).send({
      success: false,
      error: "Error interno al crear capítulo",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

fastify.put("/api/chapters/:id", async (req, res) => {
  try {
    const { mangaId } = req.params as { mangaId: string };
    const data = await req.file(); // soporta multipart
    let pdfPath = "";
    let pagesCount = 0;
    let chapterData: any = {};

    if (data) {
      if (data.fieldname === "pdf") {
        try {
          const buffer = await data.toBuffer();
          const filename = `chapter-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
          const filepath = path.join(
            __dirname,
            "public",
            "uploads",
            "chapters",
            filename,
          );

          const uploadDir = path.dirname(filepath);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          fs.writeFileSync(filepath, buffer);
          pdfPath = `/uploads/chapters/${filename}`;

          pagesCount = await countPDFPages(filepath);

          if (pagesCount === 0) {
            fs.unlinkSync(filepath);
            return res.status(400).send({
              success: false,
              error: "El archivo PDF no es válido o está dañado",
            });
          }
        } catch (fileError) {
          console.error("Error procesando archivo PDF:", fileError);
          return res.status(400).send({
            success: false,
            error: "Error al procesar el archivo PDF",
          });
        }
      }

      // Obtener campos adicionales desde multipart
      const fields = (data as any).fields;
      if (fields) {
        for (const [key, field] of Object.entries(fields)) {
          if (field && typeof field === "object" && "value" in field) {
            chapterData[key] = field.value;
          }
        }
        // Si no se subió archivo nuevo pero se pasa ruta manual de PDF
        if (!pdfPath && fields.pdfPath?.value) {
          const manualPath = fields.pdfPath.value;
          const absolute = path.join(__dirname, "public", manualPath);
          if (fs.existsSync(absolute)) {
            pdfPath = manualPath;
            pagesCount = await countPDFPages(absolute);
          }
        }
      }
    } else {
      // No multipart, datos vienen como JSON normal
      chapterData = req.body;
      if (chapterData.pdfPath) {
        const manualPath = chapterData.pdfPath;
        const absolute = path.join(__dirname, "public", manualPath);
        if (fs.existsSync(absolute)) {
          pdfPath = manualPath;
          pagesCount = await countPDFPages(absolute);
        } else {
          console.warn("Ruta de PDF proporcionada no existe:", absolute);
        }
      }
    }

    const { chapterNumber, chapterTitle, description, price } = chapterData;

    if (
      !chapterNumber ||
      !chapterTitle ||
      price === undefined ||
      !pdfPath ||
      pdfPath.trim() === ""
    ) {
      return res.status(400).send({
        success: false,
        error: "Número de capítulo, título, precio y PDF son requeridos",
      });
    }

    // Verificar que manga existe
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res
        .status(404)
        .send({ success: false, error: "Manga no encontrado" });
    }

    // Verificar que capítulo no existe con ese número
    const existingChapter = await Chapter.findOne({
      mangaId,
      chapterNumber: parseInt(chapterNumber),
    });
    if (existingChapter) {
      return res.status(400).send({
        success: false,
        error: "Ya existe un capítulo con ese número",
      });
    }

    // Crear capítulo con chapterURL como arreglo y pageCount garantizado
    const newChapter = new Chapter({
      mangaId,
      chapterNumber: parseInt(chapterNumber),
      chapterTitle: chapterTitle.trim(),
      description: description?.trim() || "",
      price: Math.max(0, parseInt(price)),
      chapterURL: [pdfPath],
      pagesCount: pagesCount,
      isPublished: true,
      publishDate: new Date(),
    });

    await newChapter.save();

    // Actualizar conteo de capítulos en manga
    const chapterCount = await Chapter.countDocuments({ mangaId });
    await Manga.findByIdAndUpdate(mangaId, { chapters: chapterCount });

    return res.send({
      success: true,
      data: newChapter.toObject(),
    });
  } catch (error) {
    console.error("Error al crear capítulo:", error);
    return res.status(500).send({
      success: false,
      error: "Error al crear capítulo",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

fastify.delete("/api/chapters/:id", async (req, res) => {
  try {
    const { id } = req.params as { id: string };

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res
        .status(404)
        .send({ success: false, error: "Capítulo no encontrado" });
    }

    // Eliminar archivo PDF si existe
    if (chapter.chapterURL && chapter.pagesCount > 0) {
      const pdfPath = path.join(__dirname, "public", chapter.chapterURL[0]);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await Chapter.findByIdAndDelete(id);

    // Actualizar el contador de capítulos en el manga
    const chapterCount = await Chapter.countDocuments({
      mangaId: chapter.mangaId,
    });
    await Manga.findByIdAndUpdate(chapter.mangaId, { chapters: chapterCount });

    return res.send({
      success: true,
      message: "Capítulo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar capítulo:", error);
    return res
      .status(500)
      .send({ success: false, error: "Error al eliminar capítulo" });
  }
});

fastify.get("/api/auth/login", async (req, res) => {
  return res.sendFile("auth.html");
});

fastify.get("/api/auth/register", async (req, res) => {
  return res.sendFile("auth.html");
});

// Endpoint de registro de usuario
fastify.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body as {
      username: string;
      email: string;
      password: string;
    };

    if (!username || !email || !password) {
      return res.status(400).send({
        success: false,
        error: "Todos los campos son requeridos",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).send({
          success: false,
          error: "El email ya está registrado. ¿Quieres iniciar sesión?",
        });
      }
      if (existingUser.username === normalizedUsername) {
        return res.status(400).send({
          success: false,
          error: "El username ya está registrado. ¿Quieres iniciar sesión?",
        });
      }
      return res.status(400).send({
        success: false,
        error: "El email o username ya están registrados.",
      });
    }

    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });
    await newUser.save();

    return res.send({
      success: true,
      message: "Usuario registrado correctamente",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).send({
        success: false,
        error:
          field === "username"
            ? "El username ya está registrado. ¿Quieres iniciar sesión?"
            : field === "email"
              ? "El email ya está registrado. ¿Quieres iniciar sesión?"
              : `El ${field} ya está registrado`,
      });
    }
    return res.status(500).send({
      success: false,
      error: `Error interno del servidor: ${error.message}`,
    });
  }
});

fastify.post("/api/auth/login", async (request, reply) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    return reply.status(400).send({
      error: "Email y contraseña son requeridos",
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return reply.status(401).send({ error: "Credenciales inválidas" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return reply.status(401).send({ error: "Credenciales inválidas" });
    }

    // Generar token de sesión
    const sessionToken = crypto.randomUUID();

    // Actualizar usuario en base de datos
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          activeSession: true,
          lastLoginAt: new Date(),
          sessionToken: sessionToken,
        },
      },
    );

    // Establecer sesión en Fastify
    (request.session as any).user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      gallecoins: user.galleCoins,
      activeSession: true,
      sessionToken: sessionToken,
    };

    // Establecer el token en la sesión
    await request.session.save();

    return reply.send({
      success: true,
      message: "Login exitoso",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        sessionToken: sessionToken,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return reply.status(500).send({ error: "Error interno del servidor" });
  }
});

fastify.post("/api/auth/logout", async (request, reply) => {
  try {
    const sessionToken = (request.session as any)?.user.sessionToken;

    const tokenToInvalidate = sessionToken;

    if (!tokenToInvalidate) {
      return reply.status(400).send({
        error: "No hay sesión activa para cerrar",
      });
    }

    // Invalidar sesión en base de datos
    const result = await User.updateOne(
      { sessionToken: tokenToInvalidate },
      {
        $set: {
          activeSession: false,
          sessionToken: null,
        },
      },
    );

    // Destruir sesión local
    if (request.session) {
      await request.session.destroy();
    }

    if (result.modifiedCount === 0) {
      return reply.status(404).send({
        error: "Sesión no encontrada",
      });
    }

    return reply.send({
      success: true,
      message: "Logout exitoso",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    return reply.status(500).send({ error: "Error al cerrar sesión" });
  }
});

//API DE PRUEBA DE SESSION
fastify.get("/api/auth/me", async (request, reply) => {
  try {
    // Obtener el token de sesión de manera segura
    const sessionUser = (request.session as any)?.user;
    const sessionToken = sessionUser?.sessionToken;

    // Obtener token del header Authorization
    const bearerHeader = request.headers.authorization;
    const tokenFromHeader = bearerHeader?.startsWith("Bearer ")
      ? bearerHeader.slice(7)
      : null;

    const tokenToCheck = sessionToken || tokenFromHeader;

    if (!tokenToCheck) {
      return reply.send({
        isAuthenticated: false,
        user: null,
        sessionToken: null,
      });
    }

    // Buscar usuario en la base de datos de manera segura
    const user = await User.findOne({
      sessionToken: tokenToCheck,
      activeSession: true,
    })
      .select("-password -__v")
      .lean();

    if (!user) {
      // Si no encontramos usuario, limpiamos la sesión por seguridad
      if (request.session) {
        await request.session.destroy();
      }

      return reply.send({
        isAuthenticated: false,
        user: null,
        sessionToken: null,
      });
    }

    // Preparar respuesta exitosa
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      gallecoins: user.galleCoins,
      sessionToken: user.sessionToken,
    };

    return reply.send({
      isAuthenticated: true,
      user: userResponse,
      sessionToken: user.sessionToken,
    });
  } catch (error) {
    console.error("Error en /api/auth/me:", error);

    // Respuesta de error detallada pero segura
    return reply.status(500).send({
      success: false,
      error: "Error interno al verificar sesión",
      message: error instanceof Error ? error.message : "Error desconocido",
    });
  }
});

fastify.get("/api/auth/refresh", async (request, reply) => {
  try {
    const sessionToken = (request.session as any).user.sessionToken;

    if (!sessionToken) {
      return reply.send({
        success: false,
        message: "No hay token proporcionado",
        user: null,
      });
    }

    const user = await User.findOne({
      sessionToken,
      activeSession: true,
    }).lean();

    if (!user) {
      return reply.send({
        success: false,
        message: "Sesión no activa o token inválido",
        user: null,
      });
    }

    return reply.send({
      success: true,
      message: "Sesión válida",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        gallecoins: user.galleCoins,
      },
    });
  } catch (error) {
    console.error("Error al refrescar sesión:", error);
    return reply.status(500).send({ error: "Error interno del servidor" });
  }
});

// Endpoint para iniciar checkout de Stripe
fastify.post("/api/gallecoins/checkout", async (req, res) => {
  try {
    const domainURL = req.headers.origin || "http://localhost:3000";
    const { amount, price, packageId } = req.body as {
      amount: number;
      price: number;
      packageId: string;
    };

    const user = (req.session as any)?.user;

    console.log("📥 Request:", { amount, price, packageId });
    console.log("👤 Usuario:", user);

    if (!user?.sessionToken) {
      return res
        .status(401)
        .send({ success: false, error: "Usuario no autenticado" });
    }

    if (!user.email) {
      return res
        .status(400)
        .send({ success: false, error: "El usuario no tiene email" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${amount} GalleCoins`,
              description: `Paquete de ${amount} GalleCoins`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${domainURL}/api/gallecoins/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/api/gallecoins/cancel`,
      metadata: {
        userId: user._id?.toString(),
        packageId,
        amount: amount.toString(),
      },
    });

    console.log("✅ Sesión de Stripe creada:", session.id);

    return res.send({ success: true, url: session.url });
  } catch (error: any) {
    console.error("❌ Error en /checkout:", error.message);
    console.error(error); // Muestra todo el objeto error
    return res.status(500).send({
      success: false,
      error: "Error al crear checkout",
      details: error.message,
    });
  }
});

fastify.get("/api/gallecoins/success", async (req, reply) => {
  const sessionId = (req.query as any).session_id;
  if (!sessionId) {
    return reply.code(400).send({ success: false, error: "Falta session_id" });
  }

  // 2.1) Recupera la sesión de Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    req.log.error(err);
    return reply
      .code(500)
      .send({ success: false, error: "Error al verificar sesión de Stripe" });
  }

  const userId = session.metadata?.userId;
  const amountNum = parseInt(session.metadata?.amount || "0", 10);
  const packageId = session.metadata?.packageId;

  // Comprueba metadata
  if (!userId || !amountNum || !packageId) {
    req.log.error("❌ Metadata incompleta:", session.metadata);
    return reply
      .code(400)
      .send({ success: false, error: "Metadata incompleta" });
  }

  // 2.2) Incrementa GalleCoins del usuario
  try {
    const before = await User.findById(userId).lean();
    req.log.info("🔔 Antes de $inc →", before?.galleCoins);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { galleCoins: amountNum } },
      { new: true },
    );
    req.log.info("✅ GalleCoins actualizados →", updatedUser?.galleCoins);
  } catch (err) {
    req.log.error("❌ Error al actualizar usuario:", err);
  }

  // 2.3) Guarda el registro de la compra
  try {
    const buy = await BuyGallecoinsModel.create({
      idUser: userId,
      idGallecoins: packageId,
      amount: amountNum,
      date: new Date(),
    });
    req.log.info("✅ Registro de compra guardado →", buy._id);
  } catch (err) {
    req.log.error("❌ Error al guardar BuyGallecoinsModel:", err);
  }

  // 2.4) Devuelve la página estática de éxito
  return reply.sendFile("success.html");
});

fastify.get("/api/gallecoins/cancel", async (req, res) => {
  return res.sendFile("cancel.html");
});

fastify.post("/api/chapters/checkout", async (req, res) => {
  try {
    const { chapterId } = req.body as { chapterId: string };
    const sessionUser = (req.session as any).user;
    const userId = sessionUser._id;

    // 1) Carga el capítulo
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res
        .code(404)
        .send({ success: false, error: "Capítulo no encontrado" });
    }

    const priceCoins = chapter.price ?? 0;
    if (priceCoins <= 0) {
      return res.code(400).send({
        success: false,
        error: "Este capítulo es gratuito o tiene precio inválido",
      });
    }

    // 2) Carga el usuario y verifica saldo
    const user = await User.findById(userId);
    if (!user) {
      return res
        .code(401)
        .send({ success: false, error: "Usuario no autenticado" });
    }
    if ((user.galleCoins ?? 0) < priceCoins) {
      return res
        .code(402)
        .send({ success: false, error: "Fondos insuficientes" });
    }

    // 3) Deduce los GalleCoins
    user.galleCoins -= priceCoins;
    await user.save();

    // 4) Registra la compra
    await BuyChaptersModel.create({
      idManga: chapter.mangaId,
      idChapter: chapter._id,
      amountCoins: priceCoins,
      date: new Date(),
    });

    // 5) Añade a la librería si no existía
    const already = await Library.findOne({ userId, idChapter: chapter._id });
    if (!already) {
      await Library.create({
        userId,
        idManga: chapter.mangaId,
        idChapter: chapter._id,
        date: new Date(),
      });
    }

    // 6) Devuelve el nuevo balance y la URL del capítulo
    return res.send({
      success: true,
      newBalance: user.galleCoins,
      chapterUrl: chapter.chapterURL, // o donde guardes la ruta
    });
  } catch (err: any) {
    req.log.error("Error en /api/chapters/checkout:", err);
    return res.code(500).send({
      success: false,
      error: "Error interno procesando la compra",
      details: err.message,
    });
  }
});

fastify.get("/api/library", async (req, reply) => {
  const user = (req.session as any).user;
  if (!user) {
    return reply.status(401).send({ success: false, error: "No auth" });
  }

  try {
    // 1. Obtener todos los ítems de la biblioteca del usuario
    const items = await Library.find({ userId: user._id }).lean();
    const chapterIds = items.map((i) => i.idChapter);

    if (chapterIds.length === 0) {
      return reply.send({ success: true, data: [] });
    }

    // 2. Traer los capítulos y su manga relacionado
    const chapters = await Chapter.find({ _id: { $in: chapterIds } })
      .populate({
        path: "mangaId",
        select: "title imageURL", // usa "cover" si así se llama tu campo de imagen
      })
      .lean();

    // 3. Formatear datos para el frontend
    const data = chapters.map((ch) => {
      const manga =
        ch.mangaId && typeof ch.mangaId === "object" ? ch.mangaId : null;

      return {
        id: ch._id.toString(),
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.chapterTitle || "Capítulo sin título",
        chapterURL: ch.chapterURL || "",
        mangaId: manga?._id?.toString() || "",
        mangaTitle: manga?.title || "Manga desconocido",
        mangaCover: manga?.imageURL || "/default-manga.jpg",
      };
    });

    return reply.send({ success: true, data });
  } catch (err) {
    console.error("Error en /api/library:", err);
    return reply.status(500).send({ success: false, error: "Server error" });
  }
});

const start = async () => {
  try {
    await connect(MONGO_URI);
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
