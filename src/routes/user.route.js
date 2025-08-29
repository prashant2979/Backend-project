import { Router } from "express";
import { loginuser, registeruser ,loggedoutuser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),  // multer middleware
  registeruser   // controller
);

router.route("/loginuser").post(loginuser)

//secured route
router.route("/loggedoutuser").post(verifyJWT,loggedoutuser)

export default router;
