// Mongoose Schema for Social Media + Marketplace App

import mongoose from "mongoose";

const { Schema } = mongoose;

// User Schema
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    bio: String,
    profilePicture: String,
    contactNumber: { type: String, unique: true },
    location: {
      address: String,
      division: String,
      district: String,
      upazila: String,
      cityCorporation: String,
      latitude: String,
      longitude: String,
    },
    themePreference: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    status: {
      type: String,
      enum: ["Online", "Away", "Busy"],
      default: "Online",
    },
    phoneOtp: String,
    phoneOtpExpiresAt: Date,
    isPhoneVerified: { type: Boolean, default: false },
    emailOtp: String,
    emailOtpExpiresAt: Date,
    isEmailVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

// Post Schema
const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    imageUrl: String,
    postType: {
      type: String,
      enum: ["public", "friends", "only_me"],
      required: true,
    },
  },
  { timestamps: true }
);

// Like Schema
const likeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

// Comment Schema
const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    content: String,
  },
  { timestamps: true }
);

// Post Share Schema
const postShareSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  postId: { type: Schema.Types.ObjectId, ref: "Post" },
  sharedAt: { type: Date, default: Date.now },
});

// Saved Post Schema
const savedPostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  postId: { type: Schema.Types.ObjectId, ref: "Post" },
  savedAt: { type: Date, default: Date.now },
});

// Notification Schema
const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    type: String,
    message: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Story Schema
const storySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    mediaUrl: String,
    caption: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

// Page Schema
const pageSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    bio: String,
    category: String,
  },
  { timestamps: true }
);

// Page Follower Schema
const pageFollowerSchema = new Schema({
  pageId: { type: Schema.Types.ObjectId, ref: "Page" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  followedAt: { type: Date, default: Date.now },
});

// Product Schema
const productSchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Wishlist Schema
const wishlistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  savedAt: { type: Date, default: Date.now },
});

// Bid Schema
const bidSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  bidAmount: Number,
  bidTime: { type: Date, default: Date.now },
});

// Transaction Schema
const transactionSchema = new Schema({
  buyerId: { type: Schema.Types.ObjectId, ref: "User" },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  amount: Number,
  purchasedAt: { type: Date, default: Date.now },
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Post: mongoose.model("Post", postSchema),
  Like: mongoose.model("Like", likeSchema),
  Comment: mongoose.model("Comment", commentSchema),
  PostShare: mongoose.model("PostShare", postShareSchema),
  SavedPost: mongoose.model("SavedPost", savedPostSchema),
  Notification: mongoose.model("Notification", notificationSchema),
  Story: mongoose.model("Story", storySchema),
  Page: mongoose.model("Page", pageSchema),
  PageFollower: mongoose.model("PageFollower", pageFollowerSchema),
  Product: mongoose.model("Product", productSchema),
  Wishlist: mongoose.model("Wishlist", wishlistSchema),
  Bid: mongoose.model("Bid", bidSchema),
  Transaction: mongoose.model("Transaction", transactionSchema),
};
