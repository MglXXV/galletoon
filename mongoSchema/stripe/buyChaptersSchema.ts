import { Schema, model } from "mongoose";

interface BuyChapters {
  idManga: Schema.Types.ObjectId;
  idChapter: Schema.Types.ObjectId;
  amountCoins: number;
  date: Date;
}

const buyChaptersSchema = new Schema<BuyChapters>(
  {
    idManga: { type: Schema.Types.ObjectId, required: true },
    idChapter: { type: Schema.Types.ObjectId, required: true },
    amountCoins: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { collection: "BuyChapter" },
);

const BuyChaptersModel = model<BuyChapters>("BuyChapter", buyChaptersSchema);

export default BuyChaptersModel;
