import { Router } from "express";
import {
  changeCurrentPassword,
  currentUser,
  loginUser,
  logout,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCover,
  updateCurrentUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/mullter.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
//secrue routes
router.route("/logout").post(verifyJWT, logout);
router.route("/current-user").post(verifyJWT, currentUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/update/avatar")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    verifyJWT,
    updateAvatar
  );
router
  .route("/update/cover")
  .post(
    upload.fields([{ name: "coverImage", maxCount: 1 }]),
    verifyJWT,
    updateCover
  );
router.route("/update/currentUser").post(verifyJWT, updateCurrentUser);
router.route("get-user").post(verifyJWT, currentUser);
export default router;
