import express from "express";
import {
  deleteMyAccount,
  getMyAccount,
  updateMyAccount,
  getAllUsers,
} from "../controllers/userController";
import { authenticateUser } from "../middlewares/protectMiddleware";
import upload from "../config/multer";

const router = express.Router();

router.use(authenticateUser);

router.route("/get-all").get(getAllUsers);
router.route("/get-me").get(getMyAccount);

router.route("/update-me").patch(upload.single("photo"), updateMyAccount);
router.route("/delete-me").delete(deleteMyAccount);

export default router;
