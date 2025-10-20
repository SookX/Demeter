const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: Number, required: true },          
  waterPerArea: { type: Number, required: true }, 
  plantedAt: { type: Date, default: Date.now },
  lastWateredAt: { type: Date, default: null },
  nextWateringAt: { type: Date, default: null },
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
    },
    region: {
      x: { type: Number },
      y: { type: Number },
      soil_type: { type: String },
      plants: [plantSchema], 
    },
  },
  { timestamps: true }
);

UserSchema.plugin(AutoIncrement, { inc_field: "id" });

module.exports = mongoose.model("User", UserSchema);
