import mongoose from "mongoose";

const connect = async (uri: string) => {
  await mongoose.connect(uri);
};

export { connect };
