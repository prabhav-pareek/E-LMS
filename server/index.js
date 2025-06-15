import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS FIRST: Top of the middleware stack
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ STEP 2: Apply it for ALL routes + preflight
app.use(cors(corsOptions));

// ✅ STEP 3: Handle OPTIONS preflight manually
app.options("*", cors(corsOptions));

// 👇 Then other middleware
app.use(express.json());
app.use(cookieParser());

// 🔗 Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});
