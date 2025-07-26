import { Schema, model } from "mongoose";

interface Manga {
  title: string;
  description: string;
  imageURL?: string;
  genre: string;
  author?: string;
  status: "ongoing" | "completed" | "hiatus";
  chapters: number;
  categories: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const mangaSchema = new Schema<Manga>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageURL: { type: String, default: "" },
    genre: { type: String, required: true },
    author: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ongoing", "completed", "hiatus"],
      default: "ongoing",
    },
    chapters: { type: Number, default: 0 },
    categories: [{ type: String }],
  },
  {
    collection: "Manga",
    timestamps: true,
  },
);

const Manga = model<Manga>("Manga", mangaSchema);

export default Manga;
