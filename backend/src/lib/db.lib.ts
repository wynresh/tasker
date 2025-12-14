import mongoose from "mongoose";
import config from "@/config.js";

export async function connect() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(config.Uri);
}
