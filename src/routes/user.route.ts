import { Router } from "express"
import { getProfile, signIn, signUp } from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { getComments } from "../controllers/scrapper.js";

const router = Router()

router.route("/sign-up").post(signUp);
router.route("/sign-in").post(signIn);
router.route("/profile").get(authenticateToken, getProfile)

router.route("/comments").get(getComments)

export { router as userRouter }