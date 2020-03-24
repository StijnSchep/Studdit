const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
  title: {
    type: String,
    required: [true, "Thread title is required"]
  },
  content: {
    type: String,
    required: [true, "Thread content is required"]
  },
  user: {
    type: Schema.Types.ObjectId,
    required: [true, "A thread needs to be attached to a person"],
    ref: "user"
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: "comment",
    default: []
  },
  upvote_users: {
    type: [Schema.Types.ObjectId],
    ref: "user",
    default: []
  },
  downvote_users: {
    type: [Schema.Types.ObjectId],
    ref: "user",
    default: []
  }
});

function autoPopulate(next) {
  this.populate({
    path: "comments",
    model: "comment"
  });

  this.populate({
    path: "user",
    model: "user",
    select: "_id name"
  });

  next();
}

ThreadSchema.pre("findOne", autoPopulate).pre("find", autoPopulate);

ThreadSchema.virtual("upvotes").get(function() {
  return this.upvote_users.length;
});

ThreadSchema.virtual("downvotes").get(function() {
  return this.downvote_users.length;
});

ThreadSchema.virtual("comment_count").get(function() {
  let sum = 0;

  for (var i = 0; i < this.comments.length; i++) {
    sum += 1 + this.comments[i].comment_count;
  }

  return sum;
});

ThreadSchema.pre("remove", async function(done) {
  const Comment = mongoose.model("comment");

  let removedComment;
  for (var i = 0; i < this.comments.length; i++) {
    removedComment = await Comment.findOneAndRemove({
      _id: this.comments[i]._id
    });
    await removedComment.remove();
  }
  done();
});

module.exports = ThreadSchema;
