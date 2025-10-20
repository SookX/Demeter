const express = require("express");
const router = express.Router();

const weatherController = require("../controllers/weatherController");
const { route } = require("./authRouter");

router.get("/current", weatherController.getCurrentWeather);
router.get("/forecast", weatherController.getForecast);
router.get("/daily", weatherController.getDailyForecast);
module.exports = router;
