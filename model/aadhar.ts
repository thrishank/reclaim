import mongoose from "mongoose";

const aadharSchema = new mongoose.Schema({
  isVerified: {
    type: Boolean,
  },
});

const aadhar = mongoose.models.aadhar || mongoose.model("aadhar", aadharSchema);

export default aadhar;
