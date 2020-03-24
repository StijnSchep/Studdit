const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: [true, "This username is already in use"]
  },

  password: {
    type: String,
    required: [true, "Password is required"]
  }
});

UserSchema.plugin(uniqueValidator);
module.exports = UserSchema;
