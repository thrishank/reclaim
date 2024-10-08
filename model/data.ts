import mongoose from "mongoose";

export interface Type extends mongoose.Document {
  username: string;
  accuracy: number;
  wpm: number;
  enter_contest: boolean;
  email: string;
}
const dataSchema = new mongoose.Schema<Type>({
  username: {
    type: String,
  },
  email: {
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

const data = mongoose.models.data || mongoose.model<Type>("data", dataSchema);

export default data;
