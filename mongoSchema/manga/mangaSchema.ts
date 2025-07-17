import { Schema, model } from "mongoose";

interface Manga {
  title: string;
  description: string;
  idCategory: number;
}

const mangaSchema = new Schema<Manga>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    idCategory: { type: Number, required: true },
  },
  { collection: "Manga" },
);

const Manga = model<Manga>("Manga", mangaSchema);

export default Manga;
