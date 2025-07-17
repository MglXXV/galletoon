import { Schema, model } from "mongoose";

interface Library {
  userId: string;
  idManga: string;
}

const LibrarySchema = new Schema<Library>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    idManga: {
      type: String,
      required: true,
      unique: false,
    },
  },
  { collection: "Library" },
);

const Library = model<Library>("Library", LibrarySchema);

export default Library;
