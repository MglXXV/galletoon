import Fastify from "fastify";
import path, { dirname } from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import "dotenv/config";
import Stripe from "stripe";
import { connect } from "./mongoSchema/database.ts";

//STRIPE URL
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const MONGO_URI = process.env.MONGO_URI as string;

//FASTIFY SETUP
const fastify = Fastify({
  logger: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// Rutas principales
fastify.get("/", async (req, res) => {
  return res.sendFile("index.html");
});

// Rutas para páginas independientes
fastify.get("/admin", async (req, res) => {
  return res.sendFile("admin.html");
});

fastify.get("/auth", async (req, res) => {
  return res.sendFile("auth.html");
});

fastify.get("/gallecoins", async (req, res) => {
  return res.sendFile("gallecoins.html");
});

fastify.get("/profile", async (req, res) => {
  return res.sendFile("profile.html");
});

fastify.get("/categorias", async (req, res) => {
  return res.sendFile("category.html");
});

fastify.get("/categories/category-action", async (req, res) => {
  return res.sendFile("categories/category-action.html");
});
fastify.get("/categories/category-adventure", async (req, res) => {
  return res.sendFile("categories/category-adventure.html");
});
fastify.get("/categories/category-drama", async (req, res) => {
  return res.sendFile("categories/category-drama.html");
});
fastify.get("/categories/category-romance", async (req, res) => {
  return res.sendFile("categories/category-romance.html");
});
fastify.get("/categories/category-horror", async (req, res) => {
  return res.sendFile("categories/category-horror.html");
});
fastify.get("/categories/category-sport", async (req, res) => {
  return res.sendFile("categories/category-sport.html");
});

// Rutas adicionales para archivos estáticos
fastify.get("/app.js", async (req, res) => {
  return res.sendFile("app.js");
});

//SERVER
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
