import Fastify from "fastify";

// Constructor : Fastify
const fastify = Fastify({
  logger: true,
});

//Objeto : Iniciar Servidor
const start = async () => {
  try {
    await fastify.listen({
      port: 3000,
      host: "0.0.0.0",
    });

    console.log("Iniciando Servidor....");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// Entry Point : Iniciando el servidor en http://localhost:3000/
start();
