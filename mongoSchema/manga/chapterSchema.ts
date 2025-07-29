import { Schema, model } from "mongoose";

interface Chapter {
  mangaId: Schema.Types.ObjectId;
  chapterNumber: number;
  chapterTitle: string;
  description?: string;
  chapterURL: string;
  pagesCount: number;
  price: number;
  isPublished: boolean;
  publishDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const chapterSchema = new Schema<Chapter>(
  {
    mangaId: { type: Schema.Types.ObjectId, ref: "Manga", required: true },
    chapterNumber: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    description: { type: String, default: "" },
    chapterURL: { type: String },
    pagesCount: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
    isPublished: { type: Boolean, default: false },
    publishDate: { type: Date },
  },
  {
    collection: "Chapter",
    timestamps: true,
  },
);

// Índice compuesto para evitar capítulos duplicados por manga
chapterSchema.index({ mangaId: 1, chapterNumber: 1 }, { unique: true });

const Chapter = model<Chapter>("Chapter", chapterSchema);

export default Chapter;
