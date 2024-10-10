import express from "express";
import { authenticateUser } from "../middlewares/protectMiddleware";
import {
  createTrip,
  deleteTrip,
  getAllMyTrips,
  updateTrip,
  reviewShipment,
  acceptShipment,
} from "../controllers/travelerController";

const router = express.Router();

router.use(authenticateUser);

router.route("/get-my-trips").get(getAllMyTrips);

router.route("/accept-shipment").post(acceptShipment);

router.route("/create-trip").post(createTrip);
router.route("/update-trip/:id").patch(updateTrip);
router.route("/delete-trip/:id").delete(deleteTrip);

router.route("/review-shipment").post(reviewShipment);

export default router;
