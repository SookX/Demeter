const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    googleId: { type: String, unique: true, sparse: true },
    username: {
      type: String,
      required: [true, "Please enter a username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [
        function () {
          return !this.googleId;
        },
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
        function () {
          return !this.googleId;
        },
        "Please enter a password",
      ],
    },
    region: {
      x: {
        type: Number,
        required: false,

      },
      y: {
        type: Number,
        required: false,
      },
      soil_type: {
        type: String,
        required: false,
      },    }
  },
  { timestamps: true }
);

UserSchema.plugin(AutoIncrement, { inc_field: "id" });

module.exports = mongoose.model("User", UserSchema);
