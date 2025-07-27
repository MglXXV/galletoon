import Fastify from "fastify";
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

//STRIPE URL
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const MONGO_URI = process.env.MONGO_URI as string;

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  secret: process.env.SESSION_KEY || "default_secret",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
});

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

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
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error("Archivo PDF no encontrado:", filePath);
      return 0;
    }

    // Leer el archivo
    const buffer = fs.readFileSync(filePath);

    // Verificar que el buffer no esté vacío
    if (!buffer || buffer.length === 0) {
      console.error("Archivo PDF vacío:", filePath);
      return 0;
    }

    // Verificar que sea un PDF válido
    const header = buffer.slice(0, 5).toString();
    if (!header.startsWith("%PDF-")) {
      console.error("Archivo no es un PDF válido:", filePath);
      return 0;
    }

    // Importar pdf-parse dinámicamente
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default;

    // Parsear el PDF
    const data = await pdfParse(buffer);

    // Verificar que se detectaron páginas
    if (!data || typeof data.numpages !== "number" || data.numpages <= 0) {
      console.error("No se pudieron detectar páginas en el PDF:", filePath);
      return 1; // Fallback a 1 página si es un PDF válido
    }

    console.log(
      `PDF ${path.basename(filePath)}: ${data.numpages} páginas detectadas`,
    );
    return data.numpages;
  } catch (error) {
    console.error("Error al contar páginas del PDF:", error);
    return 1; // Fallback a 1 página si ocurre un error
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

// Rutas para páginas independientes
fastify.get("/api/admin", async (req, res) => {
  return res.sendFile("admin.html");
});

fastify.get("/api/auth", async (req, res) => {
  return res.sendFile("auth.html");
});

fastify.get("/api/gallecoins", async (req, res) => {
  return res.sendFile("gallecoins.html");
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

fastify.post("/api/categories", async (req, res) => {
  try {
    const { categoryName, description } = req.body as {
      categoryName: string;
      description: string;
    };

    if (!categoryName || !description) {
      return res
        .status(400)
        .send({ success: false, error: "Nombre y descripción son requeridos" });
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
});

fastify.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { categoryName, description } = req.body as {
      categoryName: string;
      description: string;
    };

    if (!categoryName || !description) {
      return res
        .status(400)
        .send({ success: false, error: "Nombre y descripción son requeridos" });
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
});

fastify.delete("/api/categories/:id", async (req, res) => {
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
});

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

fastify.get("/api/mangas/:id", async (req, res) => {
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
});

fastify.post("/api/mangas", async (req, res) => {
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

    const { title, description, genre, author, categories } = mangaData;

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
      status: "ongoing",
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

fastify.put("/api/mangas/:id", async (req, res) => {
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

    const { title, description, genre, author, categories, status } = mangaData;

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
});

fastify.delete("/api/mangas/:id", async (req, res) => {
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
});

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

fastify.post("/api/mangas/:mangaId/chapters", async (req, res) => {
  try {
    const { mangaId } = req.params as { mangaId: string };
    const data = await req.file();
    let pdfPath = "";
    let pageCount = 0;
    let chapterData: any = {};

    if (data) {
      // Si hay archivo PDF
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

          fs.writeFileSync(filepath, buffer);
          pdfPath = `/uploads/chapters/${filename}`;

          // Contar páginas del PDF
          pageCount = await countPDFPages(filepath);

          if (pageCount === 0) {
            // Si no se pudieron contar las páginas, eliminar el archivo
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

      // Procesar otros campos del formulario
      const fields = data.fields;
      if (fields) {
        for (const [key, field] of Object.entries(fields)) {
          if (field && typeof field === "object" && "value" in field) {
            chapterData[key] = field.value;
          }
        }
      }
    } else {
      // Si no hay archivo, obtener datos del body
      chapterData = req.body as any;
    }

    const { chapterNumber, chapterTitle, description, price } = chapterData;

    if (!chapterNumber || !chapterTitle || price === undefined || !pdfPath) {
      return res.status(400).send({
        success: false,
        error: "Número de capítulo, título, precio y PDF son requeridos",
      });
    }

    // Verificar que el manga existe
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res
        .status(404)
        .send({ success: false, error: "Manga no encontrado" });
    }

    // Verificar si ya existe un capítulo con ese número
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

    const newChapter = new Chapter({
      mangaId,
      chapterNumber: parseInt(chapterNumber),
      chapterTitle: chapterTitle.trim(),
      description: description?.trim() || "",
      price: Math.max(0, parseInt(price)),
      pages: pdfPath ? [pdfPath] : [],
      isPublished: true,
      publishDate: new Date(),
    });

    await newChapter.save();

    // Actualizar el contador de capítulos en el manga
    const chapterCount = await Chapter.countDocuments({ mangaId });
    await Manga.findByIdAndUpdate(mangaId, { chapters: chapterCount });

    return res.send({
      success: true,
      data: {
        ...newChapter.toObject(),
        pageCount,
        pdfPath,
      },
    });
  } catch (error) {
    console.error("Error al crear capítulo:", error);
    return res
      .status(500)
      .send({ success: false, error: "Error al crear capítulo" });
  }
});

fastify.put("/api/chapters/:id", async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const data = await req.file();
    let pdfPath = "";
    let pageCount = 0;
    let chapterData: any = {};

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res
        .status(404)
        .send({ success: false, error: "Capítulo no encontrado" });
    }

    if (data) {
      // Si hay archivo PDF nuevo
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

          fs.writeFileSync(filepath, buffer);
          pdfPath = `/uploads/chapters/${filename}`;

          // Contar páginas del PDF
          pageCount = await countPDFPages(filepath);

          if (pageCount === 0) {
            // Si no se pudieron contar las páginas, eliminar el archivo
            fs.unlinkSync(filepath);
            return res.status(400).send({
              success: false,
              error: "El archivo PDF no es válido o está dañado",
            });
          }

          // Solo eliminar PDF anterior si el nuevo es válido
          if (chapter.pages && chapter.pages.length > 0) {
            const oldPdfPath = path.join(__dirname, "public", chapter.pages[0]);
            if (fs.existsSync(oldPdfPath)) {
              fs.unlinkSync(oldPdfPath);
            }
          }
        } catch (fileError) {
          console.error("Error procesando archivo PDF:", fileError);
          return res.status(400).send({
            success: false,
            error: "Error al procesar el archivo PDF",
          });
        }
      }

      // Procesar otros campos del formulario
      const fields = data.fields;
      if (fields) {
        for (const [key, field] of Object.entries(fields)) {
          if (field && typeof field === "object" && "value" in field) {
            chapterData[key] = field.value;
          }
        }
      }
    } else {
      // Si no hay archivo, obtener datos del body
      chapterData = req.body as any;
    }

    const { chapterNumber, chapterTitle, description, price, isPublished } =
      chapterData;

    if (!chapterNumber || !chapterTitle || price === undefined) {
      return res.status(400).send({
        success: false,
        error: "Número de capítulo, título y precio son requeridos",
      });
    }

    // Verificar si otro capítulo del mismo manga ya tiene ese número
    const existingChapter = await Chapter.findOne({
      mangaId: chapter.mangaId,
      chapterNumber: parseInt(chapterNumber),
      _id: { $ne: id },
    });
    if (existingChapter) {
      return res.status(400).send({
        success: false,
        error: "Ya existe un capítulo con ese número",
      });
    }

    const updateData: any = {
      chapterNumber: parseInt(chapterNumber),
      chapterTitle: chapterTitle.trim(),
      description: description?.trim() || "",
      price: Math.max(0, parseInt(price)),
      isPublished: isPublished !== undefined ? isPublished : true,
    };

    if (pdfPath) {
      updateData.pages = [pdfPath];
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedChapter) {
      return res.status(404).send({
        success: false,
        error: "Capítulo no encontrado después de actualizar",
      });
    }

    return res.send({
      success: true,
      data: {
        ...updatedChapter.toObject(),
        pageCount: pdfPath ? pageCount : chapter.pages?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error al actualizar capítulo:", error);
    return res
      .status(500)
      .send({ success: false, error: "Error al actualizar capítulo" });
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
    if (chapter.pages && chapter.pages.length > 0) {
      const pdfPath = path.join(__dirname, "public", chapter.pages[0]);
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

// Ruta de login
fastify.post("/api/auth/login", async (request, reply) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    return reply
      .status(400)
      .send({ error: "Email y contraseña son requeridos" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return reply.status(401).send({ error: "Credenciales inválidas" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return reply.status(401).send({ error: "Credenciales inválidas" });
    }

    // Guardar información del usuario en la sesión
    (request.session as any).user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    reply.send({ message: "Login exitoso" });
  } catch (error) {
    reply.status(500).send({ error: "Error interno del servidor" });
  }
});

const start = async () => {
  try {
    await connect(MONGO_URI);
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Servidor corriendo en http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
