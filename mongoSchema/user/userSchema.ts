import { Schema, model } from "mongoose";

interface User {
  username: string;
  email: string;
  password: string;
}

const Userschema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
  },
  { collection: "User" },
);

const User = model<User>("User", Userschema);

export default User;
