import mongoose from "mongoose";

const connect = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("✅ Conectado a MongoDB exitosamente");
  } catch (error: any) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    throw new Error(`Error de conexión a MongoDB: ${error.message}`);
  }

  // Manejar eventos de conexión
  mongoose.connection.on("error", (error) => {
    console.error("❌ Error de MongoDB:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB desconectado");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconectado");
  });
};

export { connect };
