const express = require("express");
const router = express.Router();

const plantController = require("../controllers/plantController");

router.post("/", plantController.addPlant);
router.put("/:plantId/water", plantController.waterPlant);
router.delete("/:plantId", plantController.removePlant);
module.exports = router;
