import { Schema, model } from "mongoose";

interface Chapter {
  idManga: number;
  pages: number;
  chapterTitle: string;
  url: string;
}

const chapterSchema = new Schema<Chapter>(
  {
    idManga: { type: Number, required: true },
    pages: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    url: { type: String, required: true },
  },
  { collection: "Chapter" },
);

const Chapter = model<Chapter>("Chapter", chapterSchema);

export default Chapter;
