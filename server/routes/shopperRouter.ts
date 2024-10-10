import express from "express";
import { authenticateUser } from "../middlewares/protectMiddleware";
import {
  createShipment,
  deleteShipment,
  getAllMyShipments,
  reviewTrip,
  updateShipment,
} from "../controllers/shopperController";
import upload from "../config/multer";

const router = express.Router();

router.use(authenticateUser);

router.route("/get-my-shipments").get(getAllMyShipments);

router.route("/create-shipment").post(upload.array("products"), createShipment);
router
  .route("/update-shipment/:id")
  .patch(upload.array("products"), updateShipment);
router.route("/delete-shipment/:id").delete(deleteShipment);

router.route("/review-trip").post(reviewTrip);

export default router;
