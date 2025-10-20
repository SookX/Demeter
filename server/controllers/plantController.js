const User = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Helper to get user from token
const getUserFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("No token provided");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || !decoded.id) throw new Error("Invalid token");

  const user = await User.findOne({ id: decoded.id });
  if (!user) throw new Error("User not found");

  return user;
};

exports.searchForPlant = async (req, res) => {
  const { query } = req.query;
    const response = await axios.get('https://trefle.io/api/v1/plants/search', {
      params: {
        token: process.env.TREFLE_API_KEY,
        q: query,
      },
    });
    res.json(response.data);
  
};

// Add a new plant
exports.addPlant = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { name, area, waterPerArea } = req.body;

    if (!name || !area || !waterPerArea) {
      return res.status(400).json({ message: "name, area, and waterPerArea are required" });
    }

    const newPlant = {
      name,
      area,
      waterPerArea,
      plantedAt: new Date(),
      lastWateredAt: null,
      nextWateringAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    user.region.plants.push(newPlant);
    await user.save();

    res.status(201).json({ message: "Plant added successfully", plant: newPlant });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message || "Server error" });
  }
};

// Get all plants for the user
exports.getPlants = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    res.status(200).json({ plants: user.region.plants });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message || "Server error" });
  }
};

// Water a plant
exports.waterPlant = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { plantId } = req.params;

    const plant = user.region.plants.id(plantId);
    if (!plant) return res.status(404).json({ message: "Plant not found" });

    plant.lastWateredAt = new Date();
    plant.nextWateringAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();
    res.status(200).json({ message: "Plant watered", plant });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message || "Server error" });
  }
};

exports.getPlantsNeedingWater = async (req, res, next) => {
    try {
      // 1️⃣ Get user from token
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return next(new AppError("No token provided", 401));
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) return next(new AppError("Invalid token", 401));
  
      const user = await User.findOne({ id: decoded.id });
      if (!user) return next(new AppError("User not found", 404));
  
      // 2️⃣ Sort plants by nextWateringAt ascending
      const plants = user.region.plants || [];
      plants.sort((a, b) => {
        if (!a.nextWateringAt) return 1;
        if (!b.nextWateringAt) return -1;
        return new Date(a.nextWateringAt) - new Date(b.nextWateringAt);
      });
  
      res.status(200).json({
        status: "success",
        plants,
      });
    } catch (error) {
      console.error("getPlantsNeedingWater error:", error);
      return next(new AppError(error.message || "Server error", 500));
    }
  };
