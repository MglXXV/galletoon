import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  lastLogin: Date;
  activeSession: boolean;
  galleCoins: number;
  sessionToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "El username es requerido"],
      unique: true,
      trim: true,
      minlength: [3, "El username debe tener al menos 3 caracteres"],
      maxlength: [30, "El username no puede tener más de 30 caracteres"],
      match: [
        /^[A-Za-z0-9_]{3,30}$/,
        "El username solo puede contener letras, números y guiones bajos",
      ],
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Por favor ingresa un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    activeSession: {
      type: Boolean,
      default: false,
    },
    galleCoins: {
      type: Number,
      default: 0,
      min: [0, "No puedes tener GalleCoins negativos"],
    },
    sessionToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    collection: "User",
    timestamps: true,
    toJSON: {
      transform: function (_, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  },
);

// Pre-save hook para hashear la contraseña
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    if (!candidatePassword || !this.password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

// Índices para mejorar el rendimiento

const User = model<IUser>("User", UserSchema);

export default User;
