import catchAsync from "../middlewares/asyncHandler";
import Trip from "../models/tripModel";
import ApiFilter from "../utils/apiFilter";
import AppError from "../utils/appError";

// Public route
// GET: /api/trips/all
export const getAllTrips = catchAsync(async (req, res, next) => {
  const baseFilter = {
    departureDate: { $gt: new Date() },
    availableSpace: { $gt: 0 },
  };

  const query = Trip.find(baseFilter);

  const apiFilter = new ApiFilter(query, req?.query)
    .filter()
    .sort()
    .pagination();

  const trips = await apiFilter.build();
  const totalTrips = await Trip.countDocuments();

  res.status(200).json({
    status: "success",
    results: trips.length,
    totalTrips,
    trips,
  });
});

// Public route
// GET: /api/trips/:id
export const getTripDetails = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id).populate("traveler");

  if (!trip) {
    return next(
      new AppError(`Could not find trip with id: ${req.params?.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    trip,
  });
});
