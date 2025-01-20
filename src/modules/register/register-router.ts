import { Router } from "express";
import RegisterController from "./register-controller";

const router = Router();

router.get("/register", RegisterController.register);

export default router;