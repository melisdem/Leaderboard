const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  country: String,
  money: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

