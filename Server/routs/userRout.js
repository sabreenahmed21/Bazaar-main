import express from "express";
const router = express.Router();
import {
  protect,
  forgetPassword,
  login,
  resetPassword,
  signup,
  verifyCode,
  verifyEmail,
  logout,
  authorizeRoles,
  updatePassword,
} from "../controllers/authController.js";
import {
  deleteMe,
  getOneUser,
  getusers,
  updateUserData,
  updateProfilePhoto,
  getProfilePhoto,
  getAllAdmins,
  deleteUserByAdmin,
  deleteAdminByAdmin,
} from "../controllers/userControll.js";
import { uploadImage } from "../middlewares/photoUpload.js";

router.get("/admin/users", protect, authorizeRoles("admin"), getusers);
router.get("/admins", protect, authorizeRoles("admin"), getAllAdmins);
router.get("/admin/:id", protect, authorizeRoles("admin"), getOneUser);
router.delete('/admin/deleteUser/:id',protect, authorizeRoles("admin"), deleteUserByAdmin);
router.delete('/admin/deleteAdmin/:id', protect, authorizeRoles("admin"), deleteAdminByAdmin);

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgetpassword", forgetPassword);
router.patch("/resetpassword/:token", resetPassword);
router.post("/verifycode", verifyCode);
router.get("/verify-email", verifyEmail);

router.delete("/delete-me", protect, deleteMe);
router.post("/logout",  logout);
router.patch("/updateUserData", protect, updateUserData);
router.post(
  "/updateProfilePhoto",
  protect,
  uploadImage.single("image"),
  updateProfilePhoto
);
router.get("/getProfilePhoto/:userId", protect, getProfilePhoto)
router.patch("/updatePassword", protect, updatePassword);
export default router;
