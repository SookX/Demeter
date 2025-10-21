const User = require("../schemas/userSchema");
const AppError = require("../utils/appError");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Groq = require("groq-sdk");

const groq = new Groq();
const BASE_URL = process.env.URL || "http://localhost:3000"; // fallback

const getUserFromToken = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError("No token provided", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded?.id) throw new AppError("Invalid token", 401);

  const user = await User.findOne({ id: decoded.id });
  if (!user) throw new AppError("User not found", 404);

  return user;
};

exports.getEvents = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    res.status(200).json({ events: user.region?.events || { event_list: [] } });
  } catch (err) {
    next(err);
  }
};

exports.markEventAsRead = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    const { eventId } = req.params;

    const event = user.region?.events?.event_list?.id(eventId);
    if (!event) return next(new AppError("Event not found", 404));

    event.markRead = true;
    await user.save();

    res.status(200).json({ message: "Event marked as read" });
  } catch (err) {
    next(err);
  }
};

exports.addEvent = async (req, res, next) => {
  try {
    const { eventType, details, eventDate } = req.body;
    const user = await getUserFromToken(req);

    const newEvent = {
      eventType,
      details,
      eventDate: eventDate ? new Date(eventDate) : new Date(),
    };

    if (!user.region.events) {
      user.region.events = { last_created: new Date(), event_list: [] };
    }

    user.region.events.event_list.push(newEvent);
    await user.save();

    res.status(201).json({ message: "Event added", event: newEvent });
  } catch (err) {
    next(err);
  }
};

exports.generateNewsWithLLM = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    const lat = user.region?.lat;
    const lon = user.region?.lon;
    if (!lat || !lon) {
      return res.status(400).json({ error: "User has no coordinates" });
    }

    const forecastRes = await axios.get(`${BASE_URL}/weather/forecast`, {
      params: { lat, lon },
    });
    const forecastData = forecastRes.data;

    const forecastText = forecastData.list
      .map(
        (item) =>
          `${item.dt_txt}: ${item.weather[0].description}, temp ${item.main.temp}°C, rain ${
            item.pop * 100
          }%`
      )
      .join("\n");

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates one plant-related weather news event per day. Respond in JSON array format.",
        },
        {
          role: "user",
          content: `
            Forecast data (hourly):
            ${forecastText}

            Rules:
            - Return max 1 event per day.
            - Include emoji, title, description, date.
            - Only create an event if something noteworthy happens (rain, frost, heat, storm).
            - Respond only in JSON array like:
            [
              { "date": "YYYY-MM-DD", "emoji": "🌧️", "title": "Rainfall expected", "description": "Heavy rainfall expected. Prepare your crops." }
            ]
          `,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    const llmOutput = chatCompletion.choices[0].message.content;
    let eventsFromLLM;
    try {
      eventsFromLLM = JSON.parse(llmOutput);
    } catch (err) {
      console.error("LLM returned invalid JSON:", llmOutput);
      return res.status(500).json({ error: "LLM returned invalid JSON" });
    }

    if (!user.region.events) {
      user.region.events = { last_created: new Date(), event_list: [] };
    }

    const newlyCreatedEvents = [];

    for (const ev of eventsFromLLM) {
      const eventDate = new Date(ev.date);
      const sameDayExists = user.region.events.event_list.some(
        (e) => e.eventDate.toDateString() === eventDate.toDateString()
      );

      if (!sameDayExists) {
        const newEvent = {
          eventType: "News",
          eventDate,
          details: `${ev.emoji}\n${ev.title}\n${ev.description}`,
        };
        user.region.events.event_list.push(newEvent);
        newlyCreatedEvents.push(newEvent);
      }
    }

    user.region.events.last_created = new Date();
    await user.save();

    res.json({
      message: "LLM news events generated",
      createdEvents: newlyCreatedEvents,
    });
  } catch (err) {
    console.error("generateNewsWithLLM error:", err);
    res.status(500).json({ error: "Failed to generate news events" });
  }
};

exports.generateReminders = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    const response = await axios.get(`${BASE_URL}/plants/plant/water`, {
      headers: { Authorization: req.headers.authorization },
    });

    const plantsNeedingWater = response.data.plants || [];

    if (plantsNeedingWater.length === 0) {
      return res.status(200).json({ message: "No plants need watering today" });
    }

    const topPlants = plantsNeedingWater.slice(0, 3);

    if (!user.events) {
      user.events = { last_created: new Date(), event_list: [] };
    }

    const today = new Date();
    const newlyCreatedReminders = [];

    for (const plant of topPlants) {
      const alreadyExists = user.region.events.event_list.some(
        (e) => e.eventType === "Reminder" && e.details.includes(plant.name)
      );

      if (!alreadyExists) {
        const newEvent = {
          eventType: "Reminder",
          eventDate: today,
          details: `💧 Water your ${plant.name} today.`,
        };

        user.region.events.event_list.push(newEvent);
        newlyCreatedReminders.push(newEvent);
      }
    }

    user.region.events.last_created = new Date();
    await user.save();

    res.json({
      message: "Reminders generated successfully",
      createdReminders: newlyCreatedReminders,
    });
  } catch (err) {
    console.error("generateReminders error:", err);
    res.status(500).json({ error: "Failed to generate reminders" });
  }
};

exports.generateTips = async (req, res) => {
  try {
    const userRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: req.headers.authorization },
    });
    
    if (!userRes) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRes.data;

    const dbUser = await User.findOne({ id: user.id });
    if (!dbUser) {
      return res.status(404).json({ error: "User not found in database" });
    }

    if (!dbUser.region.events) {
      dbUser.region.events = { last_created: new Date(), event_list: [] };
    }

    const today = new Date();

    const todayTips = dbUser.region.events.event_list.filter(
      (e) =>
        e.eventType === "Tip" &&
        e.eventDate.toDateString() === today.toDateString()
    );

    if (todayTips.length >= 3) {
      return res.status(200).json({ message: "Already have 3 tips for today" });
    }

    const userContext = `
      Region: ${dbUser.region?.climate?.zone_description || "Unknown"}
      Soil: ${dbUser.region?.soil_type || "Unknown"}
      Plants: ${dbUser.region?.plants?.map(p => p.name).join(", ") || "No plants"}
    `;

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly plant care assistant that gives short, practical daily tips related to watering, fertilizing, sunlight, and pest prevention.",
        },
        {
          role: "user",
          content: `
            Based on this user info:
            ${userContext}

            Generate 3 short and useful daily plant care tips.
            Respond **only** in JSON array like:
            [
              { "emoji": "🌿", "title": "Morning Watering", "description": "Water plants early to avoid evaporation loss." },
              { "emoji": "☀️", "title": "Sunlight Balance", "description": "Rotate potted plants for even sunlight exposure." }
            ]
          `,
        },
      ],
      temperature: 0.8,
      max_completion_tokens: 512,
    });

    const llmOutput = chatCompletion.choices[0].message.content;
    let tipsFromLLM;
    try {
      tipsFromLLM = JSON.parse(llmOutput);
    } catch (err) {
      console.error("LLM returned invalid JSON:", llmOutput);
      return res.status(500).json({ error: "Invalid LLM JSON output" });
    }

    const newTips = tipsFromLLM.slice(0, 3 - todayTips.length);

    for (const tip of newTips) {
      dbUser.region.events.event_list.push({
        eventType: "Tip",
        eventDate: today,
        details: `${tip.emoji}\n${tip.title}\n${tip.description}`,
      });
    }

    dbUser.region.events.last_created = new Date();
    await dbUser.save();

    res.status(201).json({
      message: "Tips generated successfully",
      createdTips: newTips,
    });
  } catch (err) {
    console.error("generateTips error:", err);
    res.status(500).json({ error: "Failed to generate tips" });
  }
};
