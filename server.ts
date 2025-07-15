import Fastify from "fastify";
import path, { dirname } from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import "dotenv/config";
import Stripe from "stripe";

//STRIPE URL
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

//SERVER
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
