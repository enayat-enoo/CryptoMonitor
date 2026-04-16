import mongoose from "mongoose";

async function connectToDb(url: string) {
  return await mongoose.connect(url);
}

export default connectToDb;
