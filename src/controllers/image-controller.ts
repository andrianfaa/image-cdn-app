import Crypto from "crypto";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { SendResponse } from "../helpers";
import { ImageSchema } from "../schemas";
import { CustomError } from "../utils";

type RequestWithFile = Request & {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }
}

const allowedFileExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

// Function to upload an image
export const uploadImage = async (
  req: RequestWithFile,
  res: Response,
): Promise<Response | void> => {
  const { file } = req;

  try {
    if (!file) throw new CustomError("No file provided", 400);

    const uploadPath = `${process.cwd()}/upload`;
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) throw new CustomError("Invalid file extension", 400);

    const newFilename = Crypto.randomBytes(64).toString("base64url") + fileExtension;
    const newFilePath = `${uploadPath}/${newFilename}`;

    // Save file to disk
    fs.writeFileSync(newFilePath, file?.buffer);

    if (!fs.existsSync(newFilePath)) throw new CustomError("File not found", 404);

    const image = new ImageSchema({
      filename: Crypto.randomBytes(24).toString("base64url") + fileExtension,
      file: {
        originalname: newFilename,
        mimetype: file?.mimetype,
        size: file?.size,
      },
    });
    const savedImage = await image.save();

    if (!savedImage) throw new CustomError("Could not save image", 500);

    return SendResponse<{ path: string }>(res, 200, {
      message: "Image uploaded successfully",
      data: {
        path: `/image/${savedImage.filename}`,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return SendResponse(res, error.statusCode, error.toJSON());
    }

    return SendResponse(res, 500, {
      message: "Internal server error",
    });
  }
};

// Function to get an image by filename
export const getImage = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  const { filename } = req.params as { filename: string };

  try {
    if (!filename) throw new CustomError("No filename provided", 400);

    const image = await ImageSchema.findOne({ filename });
    if (!image) throw new CustomError("Image not found", 404);

    // Check if image exists on disk
    const checkImage = fs.existsSync(`${process.cwd()}/upload/${image.file.originalname}`);
    if (!checkImage) throw new CustomError("Image not found", 404);

    return res
      .status(200)
      .set("Content-Type", image.file.mimetype)
      .sendFile(`${process.cwd()}/upload/${image.file.originalname}`);
  } catch (error) {
    if (error instanceof CustomError) {
      return SendResponse(res, error.statusCode, error.toJSON());
    }

    return SendResponse(res, 500, {
      message: "Internal server error",
    });
  }
};

// Function to delete an image by filename
export const deleteImage = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  const { filename } = req.params as { filename: string };

  try {
    if (!filename) throw new CustomError("No filename provided", 400);

    const image = await ImageSchema.findOne({ filename });
    if (!image) throw new CustomError("Image not found", 404);

    // Delete image from disk
    fs.unlinkSync(`${process.cwd()}/upload/${image.file.originalname}`);

    const deletedImage = await ImageSchema.deleteOne({ filename });
    if (!deletedImage) throw new CustomError("Could not delete image", 500);

    return SendResponse(res, 200, {
      message: "Image deleted successfully",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return SendResponse(res, error.statusCode, error.toJSON());
    }

    return SendResponse(res, 500, {
      message: "Internal server error",
    });
  }
};
