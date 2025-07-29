import { Schema, model } from "mongoose";

interface Gallecoins {
  amount: number;
  price: number;
  description: string;
}

const GallecoinsSchema = new Schema<Gallecoins>(
  {
    amount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { collection: "Gallecoins" },
);

const Gallecoins = model<Gallecoins>("Gallecoins", GallecoinsSchema);

export default Gallecoins;
