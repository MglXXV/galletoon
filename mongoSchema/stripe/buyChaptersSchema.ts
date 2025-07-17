import { Schema, model } from "mongoose";

interface BuyChapters {
  idManga: number;
  idChapter: number;
  amountCoins: number;
}

const buyChaptersSchema = new Schema<BuyChapters>(
  {
    idManga: { type: Number, required: true },
    idChapter: { type: Number, required: true },
    amountCoins: { type: Number, required: true },
  },
  { collection: "BuyChapters" },
);

const BuyChaptersModel = model<BuyChapters>("BuyChapters", buyChaptersSchema);

export default BuyChaptersModel;
