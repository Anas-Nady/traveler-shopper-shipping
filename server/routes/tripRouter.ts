import express from "express";
import { getAllTrips, getTripDetails } from "../controllers/tripController";

const router = express.Router();

router.route("/all").get(getAllTrips);
router.route("/:id").get(getTripDetails);

export default router;
