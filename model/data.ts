import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

(async () => {
  await dbConnect();
})();

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

const data = mongoose.models.data || mongoose.model<Type>("data", dataSchema);

export default data;
