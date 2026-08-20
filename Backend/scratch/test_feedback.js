import mongoose from "mongoose";
import dotenv from "dotenv";
import Feedback from "../src/Models/Feedback.js";
import { sendEmailNotification, sendWhatsAppNotification } from "../src/utils/notifier.js";

dotenv.config({ path: "./.env" });

async function runTest() {
  console.log("Testing MongoDB connection and Feedback schema...");
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not found");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const testFeedback = {
    name: "Test User",
    email: "testuser@gyantraa.in",
    rating: 5,
    category: "Suggestion",
    message: "Great feature update! The platform load speed and UI look awesome.",
    context: "Verification Plan Test",
  };

  const created = await Feedback.create(testFeedback);
  console.log("Feedback created successfully in DB:", created._id);

  const emailRes = await sendEmailNotification(created);
  console.log("Email Notification result:", emailRes);

  const waRes = await sendWhatsAppNotification(created);
  console.log("WhatsApp Notification result:", waRes);

  // Cleanup test entry
  await Feedback.findByIdAndDelete(created._id);
  console.log("Test entry cleaned up.");

  await mongoose.disconnect();
  console.log("Test completed successfully.");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
