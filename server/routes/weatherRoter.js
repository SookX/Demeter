const express = require("express");
const router = express.Router();

const weatherController = require("../controllers/weatherController");

router.get("/current", weatherController.getCurrentWeather);
router.get("/forecast", weatherController.getForecast);
router.get("/daily", weatherController.getDailyForecast);
module.exports = router;
