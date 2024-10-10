import { Document, Types } from "mongoose";

export enum UserRoles {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPPORT = "SUPPORT",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  photo: string;
  role: UserRoles;
  shipments: Types.ObjectId[];
  trips: Types.ObjectId[];
  earnings: number;
  reviews: IReview[];
  averageRating: number;
  isVerified: boolean;
  isDeleted: boolean;
  verificationCode: string | undefined;
  verificationCodeExpires: Date | undefined;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  passwordChangedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  getPasswordResetToken: () => string;
  generateVerificationCode: () => string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TripStatus {
  UNDER_REVIEW = "UNDER_REVIEW",
  PUBLISHING = "PUBLISHING",
  ON_TRAVEL = "ON_TRAVEL",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface ITrip extends Document {
  from: string;
  to: string;
  departureDate: Date;
  availableSpace: number;
  consumedSpace: number;
  status: TripStatus[];
  traveler: Types.ObjectId;
  shoppers: Types.ObjectId[];
  shipments: Types.ObjectId[];
  reviews: Types.ObjectId[];
}

export interface IProduct {
  name: string;
  quantity: number;
  category: string;
  price: number;
  link: string;
  weight: number; // in kg
  photo: string;
}

export enum ShipmentStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  PUBLISHED = "PUBLISHED",
  ACCEPTED_BY_TRAVELER = "ACCEPTED_BY_TRAVELER",
  BOOKING_COMPLETED = "BOOKING_COMPLETED",
  DELIVERED_TO_TRAVELER = "DELIVERED_TO_TRAVELER",
  DELIVERED_TO_SHOPPER = "DELIVERED_TO_SHOPPER",
  SHOPPER_FEEDBACK_RECEIVED = "SHOPPER_FEEDBACK_RECEIVED",
  CANCELED = "CANCELED",
}

export interface IShipment extends Document {
  shopper: Types.ObjectId;
  products: IProduct[];
  from: string;
  to: string;
  status: ShipmentStatus[];
  desiredDeliveryDate: Date;
  rewardPrice: number;
  trip: Types.ObjectId;
  traveler: Types.ObjectId;
  review: Types.ObjectId;
  fees: number;
}

export enum BookingMethods {
  PAYPAL = "PAYPAL",
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export interface IBooking extends Document {
  shipment: Types.ObjectId;
  user: Types.ObjectId;
  price: number;
  bookingMethod: BookingMethods;
  createdAt: Date;
  paid: boolean;
}

export interface IReview extends Document {
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  rating: number;
  comment: string;
  shipment: Types.ObjectId;
  trip: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  room: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IRoom {
  name: string;
  members: Types.ObjectId[];
  shipment: Types.ObjectId;
  unreadMessages: Types.ObjectId[];
  createdAt: Date;
}
