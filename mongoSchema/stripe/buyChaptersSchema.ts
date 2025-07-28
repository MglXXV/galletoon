import { Schema, model } from "mongoose";

interface BuyChapters {
  idManga: number;
  idChapter: number;
  amountCoins: number;
  date: Date;
}

const buyChaptersSchema = new Schema<BuyChapters>(
  {
    idManga: { type: Number, required: true },
    idChapter: { type: Number, required: true },
    amountCoins: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { collection: "BuyChapters" },
);

const BuyChaptersModel = model<BuyChapters>("BuyChapters", buyChaptersSchema);

export default BuyChaptersModel;
