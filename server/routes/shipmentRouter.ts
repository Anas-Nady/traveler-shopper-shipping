import express from "express";
import { authenticateUser } from "../middlewares/protectMiddleware";
import {
  createShipment,
  deleteShipment,
  updateShipment,
} from "../controllers/shopperController";
import {
  getAllShipments,
  getShipmentDetails,
} from "../controllers/shipmentController";
import upload from "../config/multer";

const router = express.Router();

router.route("/all").get(getAllShipments);
router
  .route("/new")
  .post(authenticateUser, upload.array("products"), createShipment);

router
  .route("/:id")
  .get(getShipmentDetails)
  .patch(authenticateUser, upload.array("products"), updateShipment)
  .delete(authenticateUser, deleteShipment);

export default router;
