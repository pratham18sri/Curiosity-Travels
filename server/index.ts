import "dotenv/config";
import { connectDB } from "./db";
import { createApp } from "./app";
try {
  await connectDB();
  createApp().listen(
    Number(process.env.API_PORT || 4000),
    process.env.API_HOST || "127.0.0.1",
    () => console.log("Curiosity API ready"),
  );
} catch {
  console.error(
    "Database connection failed. Check MONGODB_URI credentials and Atlas network access.",
  );
  process.exit(1);
}
