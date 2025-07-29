import { Schema, model } from "mongoose";

interface Library {
  userId: Schema.Types.ObjectId;
  idManga: Schema.Types.ObjectId;
  idChapter: Schema.Types.ObjectId;
  date: Date;
}

const LibrarySchema = new Schema<Library>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    idManga: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    idChapter: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { collection: "Library" },
);

const Library = model<Library>("Library", LibrarySchema);

export default Library;
