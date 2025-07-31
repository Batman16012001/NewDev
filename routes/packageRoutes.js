const express = require("express");
const packageController = require("../controllers/packageController");
const QuoteController = require("../controllers/QuotepackageController");
const fnaOutputController = require("../controllers/fnaOutputController");
const router = express.Router();

router.get("/health", packageController.healthCheck);
router.post("/proposal", packageController.getPackageData);
router.post("/quotation", QuoteController.getQuoteData);
router.post("/fna", fnaOutputController.fnaOutput);

module.exports = router;

