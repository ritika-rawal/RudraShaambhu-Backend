import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongoose.js";
import { Product } from "../models/Product.js";
import { products } from "../data/products.js";

dotenv.config();

async function run() {
  await connectToDatabase();

  await Product.deleteMany({});
  await Product.insertMany(products);

  console.log(`Seeded ${products.length} products`);
  await mongoose.connection.close();
}

run().catch(async (error) => {
  console.error("Failed to seed products", error);
  try {
    await mongoose.connection.close();
  } catch {
    // no-op
  }
  process.exit(1);
});
