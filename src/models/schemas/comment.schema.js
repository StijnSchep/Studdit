const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, "A comment needs to be attached to a person"],
    ref: "user"
  },
  content: {
    type: String,
    required: [true, "A comment needs content"]
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

CommentSchema.virtual("upvotes").get(function() {
  return this.upvote_users.length;
});

CommentSchema.virtual("downvotes").get(function() {
  return this.downvote_users.length;
});

function autoPopulate(next) {
  this.populate({
    path: "comments",
    model: "comment",
    select: "_id user content upvotes downvotes comments"
  });

  this.populate({
    path: "user",
    model: "user",
    select: "_id name"
  });
  next();
}

CommentSchema
  .pre("findOne", autoPopulate)
  .pre("find", autoPopulate)



  .pre("remove", async function(done) {
    const Thread = mongoose.model("thread");
    const Comment = mongoose.model("comment");

    await Thread.updateMany({}, { $pull: { comments: this._id } });

    let removedComment;
    for (var i = 0; i < this.comments.length; i++) {
      removedComment = await Comment.findOneAndRemove({
        _id: this.comments[i]._id
      });
      await removedComment.remove();
    }
    done();
  });

CommentSchema.virtual("comment_count").get(function() {
  let sum = 0;

  for (var i = 0; i < this.comments.length; i++) {
    // +1 for the comment itself, + the children count for that comment
    sum += 1 + this.comments[i].comment_count;
  }

  return sum;
});

module.exports = CommentSchema;
