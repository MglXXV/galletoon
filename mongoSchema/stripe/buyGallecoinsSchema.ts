import { Schema, model } from "mongoose";

interface BuyGallecoins {
  idUser: number;
  idGallecoins: number;
  amount: number;
  date: Date;
}

const buyGallecoinsSchema = new Schema<BuyGallecoins>(
  {
    idUser: { type: Number, required: true },
    idGallecoins: { type: Number, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { collection: "BuyGallecoins" },
);

const BuyGallecoinsModel = model<BuyGallecoins>(
  "BuyGallecoins",
  buyGallecoinsSchema,
);

export default BuyGallecoinsModel;
