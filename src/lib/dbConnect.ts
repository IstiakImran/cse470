import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// Singleton MongoDB client
let mongoClient: MongoClient | null = null;

export const getMongoClient = () => {
  if (!mongoClient) {
    mongoClient = new MongoClient(uri, options);
  }
  return mongoClient;
};

// Ensure database connection
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    const client = getMongoClient();
    await client.connect();
    await mongoose.connect(uri, options);
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Provide a method compatible with MongoDBAdapter
export const mongoClientInstance = async () => {
  const client = getMongoClient();
  await client.connect();
  return client;
};

export default connectDB;
