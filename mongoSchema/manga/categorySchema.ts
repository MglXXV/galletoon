import { Schema, model } from "mongoose";

interface Category {
  categoryName: string;
  description: string;
}

const categorySchema = new Schema<Category>(
  {
    categoryName: { type: String, required: true },
    description: { type: String, required: true },
  },
  { collection: "Category" },
);

const Category = model<Category>("Category", categorySchema);

export default Category;
