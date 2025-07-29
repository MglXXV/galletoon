import { Schema, model } from "mongoose";

interface BuyGallecoins {
  idUser: Schema.Types.ObjectId;
  idGallecoins: Schema.Types.ObjectId;
  amount: number;
  date: Date;
}

const buyGallecoinsSchema = new Schema<BuyGallecoins>(
  {
    idUser: { type: Schema.Types.ObjectId, required: true },
    idGallecoins: { type: Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { collection: "BuyGallecoins" },
);

const BuyGallecoinsModel = model<BuyGallecoins>(
  "BuyGallecoins",
  buyGallecoinsSchema,
);

export default BuyGallecoinsModel;
