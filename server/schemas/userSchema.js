  const mongoose = require("mongoose");
  const AutoIncrement = require("mongoose-sequence")(mongoose);

  const wateringSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, default: null }, 
  note: { type: String, default: "" }, 
});

const plantSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  plantedAt: { type: Date, default: Date.now },
  lastWateredAt: { type: Date, default: null },
  nextWateringAt: { type: Date, default: null },

  scientificName: { type: String, required: false },
  family: { type: String },
  apiId: { type: Number },
  slug: { type: String },
  imageUrl: { type: String },

  waterings: [wateringSchema],

  createdAt: { type: Date, default: Date.now },
});

  const UserSchema = new mongoose.Schema(
    {
      id: { type: Number, unique: true, index: true },
      googleId: { type: String, unique: true, sparse: true },
      username: {
        type: String,
        required: [function () { return !this.googleId; }, "Please enter a username"],
        unique: true,
        trim: true,
      },
      email: {
        type: String,
        required: [
          function () { return !this.googleId; },
          "Please enter an email",
        ],
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        minlength: 8,
        required: [
          function () { return !this.googleId; },
          "Please enter a password",
        ],
        hidden: true,
      },
      region: {
        lat: { type: Number },
        lon: { type: Number },
        soil_type: { type: String },
        climate: {
          koppen_geiger_zone: { type: String },
          zone_description: { type: String },
        },
        plants: [plantSchema], 
      },
    },
    { timestamps: true }
  );

  UserSchema.plugin(AutoIncrement, { inc_field: "id" });

  module.exports = mongoose.model("User", UserSchema);
