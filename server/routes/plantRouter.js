const express = require("express");
const router = express.Router();

const plantController = require("../controllers/plantController");

router.post("/", plantController.addPlant);
router.get("/", plantController.getPlants);

router.get("/search", plantController.searchForPlant);
router.put("/:plantId/water", plantController.waterPlant);
router.get("/plant/water", plantController.getPlantsNeedingWater); // Returns plants that need watering
router.get("/recommendations", plantController.getPlantRecommendations);

module.exports = router;
