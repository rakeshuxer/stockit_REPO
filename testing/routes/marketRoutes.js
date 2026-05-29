// const router = require("express").Router();
// const controller = require("../controllers/marketController");

// router.get("/", controller.getMarketStatus);
// router.get("/save", controller.saveMarketStatus);

// module.exports = router;   

const router = require("express").Router();
const controller = require("../controllers/marketController");

/* =========================
   GET MARKET DATA (DB)
========================= */
router.get("/get", controller.getMarketStatus);

/* =========================
   SAVE MARKET DATA (NSE → DB)
========================= */
router.post("/save", controller.saveMarketStatus);

module.exports = router;