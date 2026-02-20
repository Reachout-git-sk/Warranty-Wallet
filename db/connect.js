import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db;

async function connectDB() {
  if (db) return db;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("warrantyWallet");
  console.log("Connected to MongoDB");
  return db;
}

export default connectDB;