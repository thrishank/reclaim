import mongoose from "mongoose";

export interface Type extends mongoose.Document {
  username: string;
  accuracy: number;
  wpm: number;
  enter_contest: boolean;
}
const dataSchema = new mongoose.Schema<Type>({
  username: {
    type: String,
  },
  accuracy: {
    type: Number,
  },
  wpm: {
    type: Number,
  },
  enter_contest: {
    type: Boolean,
  },
});

const aadharSchema = new mongoose.Schema({
  isVerified: {
    type: Boolean,
  },
});

const aadhar = mongoose.models.aadhar || mongoose.model<Type>("aadhar", aadharSchema);
const data = mongoose.models.data || mongoose.model<Type>("data", dataSchema);

export default data;
