import catchAsync from "../middlewares/asyncHandler";
import Shipment from "../models/shipmentModel";
import ApiFilter from "../utils/apiFilter";
import AppError from "../utils/appError";

// Public route
// GET: /api/shipments/all
export const getAllShipments = catchAsync(async (req, res, next) => {
  const baseFilter = { desiredDeliveryDate: { $gt: new Date() } };
  const query = Shipment.find(baseFilter);

  const apiFilter = new ApiFilter(query, req.query)
    .filter()
    .sort()
    .pagination();

  const shipments = await apiFilter.build();
  const totalShipments = await Shipment.countDocuments();

  res.status(200).json({
    status: "success",
    results: shipments.length,
    totalShipments,
    shipments,
  });
});

// Public route
// GET: /api/shipments/:id
export const getShipmentDetails = catchAsync(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate("shopper")
    .populate("traveler")
    .populate("review");

  if (!shipment) {
    return next(
      new AppError(`Could not find shipment with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    shipment,
  });
});
