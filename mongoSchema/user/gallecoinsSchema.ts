import { Schema, model } from "mongoose";

interface Gallecoins {
  userId: string;
  amount: number;
}

const GallecoinsSchema = new Schema<Gallecoins>(
  {
    userId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { collection: "Gallecoins" },
);

const Gallecoins = model<Gallecoins>("Gallecoins", GallecoinsSchema);

export default Gallecoins;
