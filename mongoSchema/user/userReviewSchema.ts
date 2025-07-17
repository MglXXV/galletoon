import { Schema, model } from "mongoose";

interface UserReview {
  idUser: number;
  idManga: number;
  comment: string;
  date: Date;
}

const UsersReviewchema = new Schema<UserReview>(
  {
    idUser: {
      type: Number,
      required: true,
      unique: true,
    },
    idManga: {
      type: Number,
      required: true,
      unique: true,
    },
    comment: {
      type: String,
      required: true,
      unique: false,
    },
    date: {
      type: Date,
      required: true,
      unique: false,
    },
  },
  { collection: "UserReview" },
);

const UserReview = model<UserReview>("UserReview", UsersReviewchema);

export default UserReview;
