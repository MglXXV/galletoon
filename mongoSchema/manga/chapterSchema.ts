import { Schema, model } from "mongoose";

interface Chapter {
  idManga: number;
  chapterTitle: string;
  pages: number;
  url: string;
  amountGallecoins: number;
}

const chapterSchema = new Schema<Chapter>(
  {
    idManga: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    pages: { type: Number, required: true },
    url: { type: String, required: true },
    amountGallecoins: { type: Number, required: true },
  },
  { collection: "Chapter" },
);

const Chapter = model<Chapter>("Chapter", chapterSchema);

export default Chapter;
