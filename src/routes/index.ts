import { Router } from "express";
import ImageRoute from "./image-route";

const router = Router();

router.use("/image", ImageRoute);

export default router;
