const User = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Groq = require("groq-sdk");
const AppError = require("../utils/AppError");
const client = new Groq();

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
    console.log(response.data);
    res.json(response.data);
  
};

exports.addPlant = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      scientificName,
      commonName,
      family,
      apiId,
      slug,
      imageUrl,
      plantedAt,
    } = req.body;

    if (!name || !scientificName) {
      return res
        .status(400)
        .json({ message: "Both 'name' and 'scientificName' are required." });
    }

    const newPlant = {
      name: name,
      scientificName: scientificName,
      commonName: commonName || "",
      family: family || "",
      apiId: apiId || null,
      slug: slug || "",
      imageUrl: imageUrl || "",
      plantedAt: plantedAt ? new Date(plantedAt) : new Date(),
      lastWateredAt: null,
      nextWateringAt: new Date(Date.now() + 24 * 60 * 60 * 1000), 
      waterings: [],
    };

    user.region.plants.push(newPlant);
    await user.save();

    res.status(201).json({
      message: "Plant added successfully",
      plant: newPlant,
    });
  } catch (err) {
    console.error("Error adding plant:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPlants = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    res.status(200).json({ plants: user.region.plants });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message || "Server error" });
  }
};

exports.waterPlant = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { plantId } = req.params;
    const { amount } = req.body;

    

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const plant = user.region.plants.id(plantId);
    const now = new Date();
    plant.waterings.push({ date: now, amount });
    plant.lastWateredAt = now;
    plant.nextWateringAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await user.save();
    res.json({ message: "Watering added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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

exports.getPlantRecommendations = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return next(new AppError('Unauthorized', 401));

    const region = user.region || {};
    const soilType = region.soil_type;
    if (!soilType) return next(new AppError('Soil type not set', 400));

    const climate = region.climate || {};
    const climateZone = climate.koppen_geiger_zone || 'unknown';
    const climateDescription = climate.zone_description || 'unknown';

    const prompt = `
      You are an expert agronomist.
      Suggest a list of plant names suitable for the following conditions:
      - Soil type: ${soilType}
      - Climate zone: ${climateZone}
      - Climate description: ${climateDescription}
      Only provide the names of the plants, separated by commas.
    `;

    const params = {
      messages: [
        { role: 'system', content: 'You are a helpful agronomist assistant.' },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile', 
      temperature: 1,
      max_completion_tokens: 200,
      stream: false, 
    };

    const chatCompletion = await client.chat.completions.create(params);

    const plantText = chatCompletion.choices?.[0]?.message?.content || chatCompletion.output_text || '';
    const plantNames = plantText
      .split(',')
      .map(p => p.trim())
      .filter(p => p);

    return res.json({
      recommendedPlants: plantNames
    });
  } catch (error) {
    console.error('recommendedPlants error:', error);
    return next(new AppError(error.message || 'Server error', 500));
  }
};
