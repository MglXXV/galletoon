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

//API ROUTES
fastify.get("/", async (req, res) => {
  return res.sendFile("index.html");
});

// SPA Routes - todas las rutas del frontend deben servir index.html
fastify.get("/home", async (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/login", async (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/register", async (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/profile", async (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/manga", async (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/categorias", async (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/categorias/*", async (req, res) => {
  return res.sendFile("index.html");
});

// Rutas para SPAs independientes
fastify.get("/admin", async (req, res) => {
  return res.sendFile("admin.html");
});

fastify.get("/auth", async (req, res) => {
  return res.sendFile("auth.html");
});

fastify.get("/gallecoins", async (req, res) => {
  return res.sendFile("gallecoins.html");
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
