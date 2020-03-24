const mongoose = require("mongoose");
const UserSchema = require("./schemas/user.schema");

const User = mongoose.model("user", UserSchema);

module.exports = User;
