const mongoose = require("mongoose");
const CommentSchema = require("./schemas/comment.schema");

const Comment = mongoose.model("comment", CommentSchema);

module.exports = Comment;
