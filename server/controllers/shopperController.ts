import catchAsync from "../middlewares/asyncHandler";
import Review from "../models/reviewModel";
import Shipment from "../models/shipmentModel";
import Trip from "../models/tripModel";
import User from "../models/userModel";
import { IProduct, IReview, ShipmentStatus, TripStatus } from "../types/types";
import AppError from "../utils/appError";

// Protected route
// GET: /api/shopper/get-my-shipments
export const getAllMyShipments = catchAsync(async (req, res, next) => {
  const shopperId = req.user?._id;

  const user = await User.findById(shopperId);

  if (!shopperId || !user) {
    return next(new AppError("You are not logged in or user not found", 401));
  }

  const shipments = await Shipment.find({ shopper: shopperId });

  res.status(200).json({
    success: true,
    shipments,
  });
});

// Protected route
// POST: /api/shopper/create-shipment
export const createShipment = catchAsync(async (req, res, next) => {
  // check if user already exists.
  const shopperId = req.user?._id;
  const user = await User.findById(shopperId);

  if (!shopperId || !user) {
    return next(new AppError("You are not logged in or user not found", 401));
  }

  // check if shopper has enough shipment requests.
  const shipmentCount = await Shipment.countDocuments({
    shopper: shopperId,
    status: {
      $in: [
        ShipmentStatus.PENDING,
        ShipmentStatus.UNDER_REVIEW,
        ShipmentStatus.PUBLISHED,
      ],
    },
  });

  if (shipmentCount === 3) {
    return next(
      new AppError(
        "You have reached the maximum number of shipments allowed",
        400
      )
    );
  }

  // create a new shipment
  const { from, to, desiredDeliveryDate, rewardPrice, products } = req.body;
  if (
    !Array.isArray(products) ||
    products.length === 0 ||
    !from ||
    !to ||
    !desiredDeliveryDate ||
    !rewardPrice
  ) {
    return next(
      new AppError("Please provide all required fields correctly", 400)
    );
  }

  if (req.files?.length !== products.length) {
    return next(
      new AppError(
        "Number of uploaded photos doesn't match the number of products",
        400
      )
    );
  }

  const productsDetails = Promise.all(
    products.map(async (product: IProduct, idx: number) => {
      const { name, quantity, category, price, link, weight } = product;
      const { path } = req.files[idx];

      return {
        name,
        quantity,
        category,
        price,
        link,
        weight,
        photo: path,
      };
    })
  );

  const newShipment = await Shipment.create({
    shopper: shopperId,
    from,
    to,
    desiredDeliveryDate,
    rewardPrice,
    products: await productsDetails,
  });

  if (!newShipment) {
    return next(new AppError("Failed to create new shipment", 500));
  }

  res.status(201).json({
    status: "success",
    shipment: newShipment,
    message: "Shipment created successfully",
  });
});

// Protected route
// PATCH: /api/shopper/update-shipment/:id
export const updateShipment = catchAsync(async (req, res, next) => {
  const shopperId = req.user._id;
  const shipmentId = req.params.id;

  const shipment = await Shipment.findOne({
    _id: shipmentId,
    shopper: shopperId,
  });

  if (!shipment) {
    return next(new AppError("Shipment not found or not related to you", 404));
  }

  if (shipment.status.includes(ShipmentStatus.ACCEPTED_BY_TRAVELER)) {
    return next(new AppError("Shipment has already been accepted", 400));
  }

  const { desiredDeliveryDate, rewardPrice, from, to, products } = req.body;

  shipment.rewardPrice = rewardPrice || shipment.rewardPrice;

  shipment.desiredDeliveryDate =
    desiredDeliveryDate || shipment.desiredDeliveryDate;
  shipment.from = from || shipment.from;
  shipment.to = to || shipment.to;

  if (products && products.length > 0) {
    const productsDetails = Promise.all(
      products.map(async (product: IProduct, idx: number) => {
        const { name, quantity, category, price, link, weight } = product;
        const { path } = req.files[idx];

        return {
          name,
          quantity,
          category,
          price,
          link,
          weight,
          photo: path,
        };
      })
    );
    shipment.products = productsDetails;
  }

  await shipment.save();
});

// Protected route
// DELETE: /api/shopper/delete-shipment/:id
export const deleteShipment = catchAsync(async (req, res, next) => {
  const shopperId = req.user?._id;
  const shipmentId = req.params.id;
  const user = await User.findById(shopperId);

  if (!shopperId || !user) {
    return next(new AppError("You are not logged in or user not found", 401));
  }

  const shipment = await Shipment.findOne({
    shopper: shopperId,
    _id: shipmentId,
  });

  if (!shipment) {
    return next(new AppError("Shipment not found or not related to you", 404));
  }

  const deletableStatuses = [
    ShipmentStatus.PENDING,
    ShipmentStatus.UNDER_REVIEW,
    ShipmentStatus.PUBLISHED,
  ];

  // Check if the shipment is in a deletable status
  if (deletableStatuses.includes(shipment.status)) {
    await Shipment.findByIdAndDelete(shipment._id);
    return res.status(200).json({
      status: "success",
      message: "Shipment deleted successfully",
    });
  } else {
    return next(
      new AppError(
        "Cannot delete this shipment. It has already been accepted by a traveler",
        403
      )
    );
  }
});

// Protected route
// POST: /api/shopper/review-trip
export const reviewTrip = catchAsync(async (req, res, next) => {
  // check if user already exists.
  const { rating, comment } = req.body;
  const reviewerId = req.user?._id;
  const reviewer = await User.findById(reviewerId);

  const travelerId = req.params.travelerId;
  const traveler = await User.findById(travelerId);

  if (!reviewerId) {
    return next(new AppError("You are not logged in.", 401));
  }

  if (!reviewer) {
    return next(new AppError("Reviewer not found", 404));
  }

  if (!travelerId) {
    return next(new AppError("Please provide a valid travelerId", 400));
  }

  if (!traveler) {
    return next(new AppError("Traveler not found", 404));
  }

  const trip = await Trip.findOne({
    shoppers: { $in: [reviewerId] },
    traveler: travelerId,
  }).populate("reviews");

  if (!trip) {
    return next(
      new AppError("There is no trip between you and this traveler.", 404)
    );
  }

  // check if the shopper has already reviewed the trip.
  trip.reviews.forEach((review: IReview) => {
    if (review.reviewer.toString() === reviewerId.toString()) {
      return next(new AppError("You have already reviewed this trip", 400));
    }
  });

  if (
    !trip.status.includes(TripStatus.ON_TRAVEL) ||
    !trip.status.includes(TripStatus.COMPLETED) ||
    !trip.status.includes(TripStatus.CANCELLED)
  ) {
    return next(
      new AppError(
        "You cannot review trips that are not on-travel, completed or cancelled",
        400
      )
    );
  }

  const newReview = await Review.create({
    reviewer: reviewerId,
    reviewee: travelerId,
    rating,
    comment,
  });

  if (!newReview) {
    return next(new AppError("Failed to create review", 500));
  }

  trip.reviews.push(newReview._id);
  await trip.save();

  res.status(201).json({
    status: "success",
    review: newReview,
    message: "Review created successfully",
  });
});

// read QR-Code of shipment to update shipment's Status delivered
