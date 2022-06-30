import { Router } from "express";
import { ImageController } from "../controllers";
import uploadMiddleware from "../middlewares/upload-middleware";

const router = Router();

router.post("/", uploadMiddleware.single("image"), ImageController.uploadImage);
router.delete("/:filename", ImageController.deleteImage);

export default router;
