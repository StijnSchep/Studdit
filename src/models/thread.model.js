const mongoose = require("mongoose");
const ThreadSchema = require("./schemas/thread.schema");

const Thread = mongoose.model("thread", ThreadSchema);

module.exports = Thread;
