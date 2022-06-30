import { Schema, model } from "mongoose";
import Crypto from "crypto";

interface ImageSchemaType {
  _id: string;
  uid?: string;
  filename: string;
  file: {
    originalname: string;
    mimetype: string;
    size: number;
  };
  uploadDate: number;
}

const ImageSchema = new Schema<ImageSchemaType>({
  _id: {
    type: String,
    default: Crypto.randomBytes(16).toString("hex"),
  },
  uid: {
    type: String,
    default: "",
  },
  filename: {
    type: String,
    required: true,
  },
  file: {
    originalname: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  uploadDate: {
    type: Number,
    default: Date.now,
  },
});

export default model<ImageSchemaType>("Image", ImageSchema);
