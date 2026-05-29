const MarketStatus = require("../models/MarketStatus");

const BASE_URL = "https://www.nseindia.com";
const API_URL = "https://www.nseindia.com/api/marketStatus";

/* =========================
   COMMON HEADERS
========================= */
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.nseindia.com/",
};

/* =========================
   STEP 1: CREATE SESSION
========================= */
const createSession = async () => {
  await fetch(BASE_URL, {
    method: "GET",
    headers,
  });
};

/* =========================
   STEP 2: FETCH MARKET DATA
========================= */
const fetchMarketData = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers,
  });

  const text = await response.text();
console.log(text)
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("NSE blocked request or returned invalid response");
  }
};

/* =========================
   SAVE MARKET DATA
========================= */
module.exports.saveMarketStatus = async (req, res) => {
  try {
    // STEP 1 + STEP 2
    await createSession();
    const data = await fetchMarketData();

    console.log("Fetched Data:", data);

    await MarketStatus.findOneAndUpdate(
      { type: "latest" }, // FIXED: avoid empty filter
      { marketStatus: data },
      { upsert: true, new: true }
    );

    res.json({
      message: "Saved successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error saving data",
      error: err.message,
    });
  }
};

/* =========================
   GET MARKET DATA
   (from DB only - FAST & SAFE)
========================= */
module.exports.getMarketStatus = async (req, res) => {
  try {
    const data = await MarketStatus.findOne({ type: "latest" });

    res.json({
      marketStatus: data?.marketStatus || {},
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching data",
      error: err.message,
    });
  }
};














// const MarketStatus = require("../models/MarketStatus");

// const URL = "https://www.nseindia.com/api/marketStatus";

// /* =========================
//    SAVE MARKET DATA
// ========================= */
// module.exports.saveMarketStatus = async (req, res) => {
//   try {
//     const response = await fetch(URL, {
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//         Accept: "application/json",
//         Referer: "https://www.nseindia.com",
//       },
//     });

//     const data = await response.json();
// console.log(data)
//     await MarketStatus.findOneAndUpdate(
//       {},
//       { marketStatus: data },
//       { upsert: true, new: true }
//     );

//     res.json({
//       message: "Saved successfully",
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error saving data",
//       error: err.message,
//     });
//   }
// };

// /* =========================
//    GET MARKET DATA
// ========================= */
// module.exports.getMarketStatus = async (req, res) => {
//   try {

//       const response = await fetch("https://www.nseindia.com", {
//   headers: {
//     "User-Agent": "Mozilla/5.0",
//   },
// });
//       const response = await fetch(URL, {
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//         Accept: "application/json",
//         Referer: "https://www.nseindia.com",
//       },
//     }); */

//     const data1 = await response.json();
// console.log(data1)
//     const data = await MarketStatus.findOne();

//     res.json({
//       marketStatus: data?.marketStatus || {},
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching data",
//       error: err.message,
//     });
//   }
// }; *



/* =========================
   SIMPLE GET + CONSOLE LOG
========================= */
module.exports.getMarketStatus = async (req, res) => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: "https://www.nseindia.com/",
      },
    });

    const text = await response.text();

    console.log("📦 RAW NSE RESPONSE:");
    console.log(text);

    let data;

    try {
      data = JSON.parse(text);
      console.log("✅ PARSED NSE DATA:");
      console.log(data);
    } catch (err) {
      console.log("🚨 Not JSON (NSE blocked or HTML response)");
      data = null;
    }

    res.json({
      success: true,
      message: "Check server console for NSE data",
      data,
    });
  } catch (err) {
    console.log("🔥 ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: "Error fetching NSE data",
      error: err.message,
    });
  }
};

