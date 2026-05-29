// // const express = require("express");

// // const app = express();

// // /* =========================
// //    MIDDLEWARE
// // ========================= */
// // app.use(express.json());

// // /* =========================
// //    ROUTES
// // ========================= */

// // // Home route
// // app.get("/", (req, res) => {
// //   res.send("🚀 Express Server Running");
// // });

// // // Test API
// // app.get("/test", (req, res) => {
// //   res.json({
// //     message: "✅ API Working Fine",
// //     success: true,
// //   });
// // });

// // /* =========================
// //    START SERVERA
// // ========================= */
// // const PORT = 5004;

// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running at http://localhost:${PORT}`);
// // });

// const express = require("express");

// const app = express();

// const MARKET_STATUS_URL =
//   "https://www.nseindia.com/api/marketStatus";

// /* =========================
//    MIDDLEWARE
// ========================= */
// app.use(express.json());

// /* =========================
//    HOME ROUTE
// ========================= */
// app.get("/", (req, res) => {
//   res.send("🚀 Express Server Running");
// });

// /* =========================
//    TEST API
// ========================= */
// app.get("/test", (req, res) => {
//   res.json({
//     message: "✅ API Working Fine",
//     success: true,
//   });
// });

// /* =========================
//    NSE MARKET API
// ========================= */
// app.get("/api/market", async (req, res) => {
//   try {
//     const response = await fetch(MARKET_STATUS_URL, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
//         Accept: "application/json",
//         Referer: "https://www.nseindia.com",
//         "Accept-Language": "en-US,en;q=0.9",
//       },
//     });

//     if (!response.ok) {
//       return res.status(400).json({
//         message: "Failed to fetch NSE data",
//       });
//     }

//     const data = await response.json();
// console.log(data)
//     res.json({
//       message: "Market data fetched successfully",
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

// /* =========================
//    START SERVER
// ========================= */
// const PORT = 5004;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });


// ----- new code -----

// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const connectDB = require("./config/db");
// const marketRoutes = require("./routes/marketRoutes");

// const app = express();

// /* =========================
//    DB CONNECT
// ========================= */
// connectDB();

// /* =========================
//    MIDDLEWARE
// ========================= */
// app.use(cors());
// app.use(express.json());

// /* =========================
//    ROUTES
// ========================= */
// app.use("/api/market", marketRoutes);

// /* =========================
//    HOME
// ========================= */
// app.get("/", (req, res) => {
//   res.send("🚀 Stockit Backend Running");
// });

// /* =========================
//    START SERVER
// ========================= */
// const PORT = process.env.PORT || 5004;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

// ***** final code ***** 

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const marketRoutes = require("./routes/marketRoutes");

const app = express();

/* =========================
   1. DB CONNECT (SAFE HANDLING)
========================= */
connectDB().catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});

/* =========================
   2. MIDDLEWARE (ORDER FIXED)
========================= */

// CORS (allow frontend + tools)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   3. ROUTES (FIXED + SAFE)
========================= */

// Health check BEFORE API routes
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "🚀 Stockit Backend Running",
  });
});

// API routes
app.use("/api/market", marketRoutes);

/* =========================
   4. 404 HANDLER (IMPORTANT FIX)
========================= */
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* =========================
   5. GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

/* =========================
   6. START SERVER (FIXED LOGGING)
========================= */
const PORT = process.env.PORT || 5004;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/* =========================
   7. GRACEFUL SHUTDOWN (BONUS FIX)
========================= */
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
  });
});