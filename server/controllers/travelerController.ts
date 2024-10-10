import catchAsync from "../middlewares/asyncHandler";
import Review from "../models/reviewModel";
import Shipment from "../models/shipmentModel";
import Trip from "../models/tripModel";
import User from "../models/userModel";
import { IProduct, ShipmentStatus, TripStatus } from "../types/types";
import AppError from "../utils/appError";

// Protected route
// POST: /api/traveler/accept-shipment
export const acceptShipment = catchAsync(async (req, res, next) => {
  const shipmentId = req.params.shipmentId;
  const tripId = req.params.tripId;
  const travelerId = req.user?._id;

  const traveler = await User.findById(travelerId);

  if (!travelerId || !traveler) {
    return next(
      new AppError("You are not logged in or traveler not found", 401)
    );
  }

  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    return next(
      new AppError(`Could not find shipment with id: ${shipmentId}`, 404)
    );
  }

  if (shipment.status.includes(ShipmentStatus.ACCEPTED_BY_TRAVELER)) {
    return next(new AppError("Shipment has already been accepted", 400));
  }

  const trip = await Trip.findOne({ _id: tripId, traveler: travelerId });
  if (!trip) {
    return next(new AppError("Trip not found or not related to you", 404));
  }

  if (shipment.desiredDeliveryDate < trip.departureDate) {
    return next(
      new AppError(
        "Shipment's desired delivery date is before trip's departure date",
        400
      )
    );
  }

  const totalWeights = shipment.product.reduce(
    (acc: number, curr: IProduct) => acc + curr.weight,
    0
  );

  if (totalWeights > trip.availableSpace) {
    return next(
      new AppError(
        "Total weight of products exceeds available space in the trip",
        400
      )
    );
  }
  trip.availableSpace -= totalWeights;
  trip.consumedSpace += totalWeights;
  trip.status.push(TripStatus.ON_TRAVEL);
  await trip.save();

  shipment.status.push(ShipmentStatus.ACCEPTED_BY_TRAVELER);
  shipment.traveler = traveler._id;
  await shipment.save();
});

// Protected route
// GET: /api/traveler/get-my-trips
export const getAllMyTrips = catchAsync(async (req, res, next) => {
  const travelerId = req.user?._id;

  const user = await User.findById(travelerId);
  if (!travelerId || !user) {
    return next(new AppError("You are not logged in or user not found", 401));
  }

  const trips = await Trip.find({ traveler: travelerId });

  res.status(200).json({
    status: "success",
    results: trips.length,
    trips,
  });
});

// Protected route
// POST: /api/traveler/create-trip
export const createTrip = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("You are not logged in or user not found", 401));
  }

  const { from, to, departureDate, availableSpace } = req.body;

  // we need to verify the real human face before creating

  const newTrip = await Trip.create({
    from,
    to,
    departureDate,
    availableSpace,
    traveler: userId,
  });

  res.status(201).json({
    status: "success",
    trip: newTrip,
    message: "Trip created successfully",
  });
});

// Protected route
// PATCH: /api/traveler/update-trip
export const updateTrip = catchAsync(async (req, res, next) => {
  const { departureDate, availableSpace } = req.body;
  const tripId = req.params.id;
  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("You are not logged in or user not found", 401));
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return next(new AppError("Trip not found", 404));
  }

  if (trip.traveler.toString() !== userId.toString()) {
    return next(new AppError("You cannot update trip that is not yours", 400));
  }

  if (
    !trip.status.includes(TripStatus.ON_TRAVEL) ||
    !trip.status.includes(TripStatus.COMPLETED) ||
    !trip.status.includes(TripStatus.CANCELLED)
  ) {
    return next(
      new AppError("You cannot update completed or cancelled trips", 400)
    );
  }

  if (departureDate) {
    trip.departureDate = departureDate;
  }
  if (availableSpace) {
    trip.availableSpace = availableSpace;
  }

  await trip.save();

  res.status(200).json({
    status: "success",
    trip,
  });
});

// Protected route
// DELETE: /api/traveler/delete-trip
export const deleteTrip = catchAsync(async (req, res, next) => {
  const tripId = req.params.id;
  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("You are not logged in or user not found", 401));
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return next(new AppError("Trip not found", 404));
  }

  if (trip.traveler.toString() !== userId.toString()) {
    return next(new AppError("You cannot delete trip that is not yours", 400));
  }

  if (
    trip.status.includes(TripStatus.COMPLETED) ||
    trip.status.includes(TripStatus.ON_TRAVEL)
  ) {
    return next(
      new AppError("You cannot delete completed or on-travel trips", 400)
    );
  }

  await Trip.findByIdAndDelete(trip._id);
  res.status(204).json({
    status: "success",
    message: "Trip deleted successfully",
  });
});

// Protected route
// POST: /api/traveler/review-shipment
export const reviewShipment = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  const reviewerId = req.user?._id;
  const reviewer = await User.findById(reviewerId);

  const shopperId = req.params.shopperId;
  const shopper = await User.findById(shopperId);

  if (!reviewerId) {
    return next(new AppError("You are not logged in.", 401));
  }

  if (!reviewer) {
    return next(new AppError("Reviewer not found", 404));
  }

  if (!shopperId) {
    return next(new AppError("Please provide a valid shopperId", 400));
  }

  if (!shopper) {
    return next(new AppError("Traveler not found", 404));
  }

  const shipment = await Shipment.findOne({
    shopper: shopperId,
    traveler: reviewerId,
  });

  if (!shipment) {
    return next(
      new AppError("There is no trip between you and this shopper.", 404)
    );
  }

  if (shipment.review) {
    return next(new AppError("You have reviewed this trip before", 400));
  }

  if (shipment.status !== ShipmentStatus.DELIVERED_TO_SHOPPER) {
    return next(
      new AppError(
        "You cannot review this trip until delivered it to the shopper",
        400
      )
    );
  }

  const newReview = await Review.create({
    reviewer: reviewerId,
    reviewee: shopperId,
    rating,
    comment,
  });

  if (!newReview) {
    return next(new AppError("Failed to create review", 500));
  }
  shipment.review = newReview._id;
  await shipment.save();

  res.status(201).json({
    status: "success",
    review: newReview,
    message: "Review created successfully",
  });
});
