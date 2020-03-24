const logger = require("../config/appconfig").logger;

const Comment = require("../models/comment.model");
const User = require("../models/user.model");
const Thread = require("../models/thread.model");

// Add comment to comment
module.exports.addComment = async function(req, res, next) {
  /*
        Body: 
        {
            id:    <e.g. "nice post">,
            comment:   <e.g. "MyName">
        }
    */
  const user = await User.findOne({ name: req.body.username });

  let commentToBeCommented;
  try {
    commentToBeCommented = await Comment.findOne({ _id: req.params.id });
  } catch (err) {
    next({ message: "", code: 204 });
    return;
  }

  if (!commentToBeCommented) {
    next({ message: "", code: 204 });
    return;
  }

  // TODO: throw error if user does not exist
  const properties = {
    user: user,
    content: req.body.content
  };

  try {
    const comment = new Comment(properties);
    await comment.save();

    const commentToBeUpdated = await Comment.findOne({
      _id: commentToBeCommented._id
    });
    commentToBeUpdated.comments.push(comment);

    await commentToBeUpdated.save();

    const response = {
      _id: comment._id,
      content: comment.content,
      user: user.name,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes
    };

    res.status(200).json(response);
  } catch (err) {
    logger.info(err);
    const errorObject = {
      message: err._message,
      errors: err.errors,
      code: 400
    };
    next(errorObject);
  }
};

module.exports.delete = async function(req, res, next) {
  const commentID = req.params.id;

  let commentToBeDeleted;
  try {
    commentToBeDeleted = await Comment.findOne({ _id: req.params.id });
  } catch (err) {
    next({ message: "", code: 204 });
    return;
  }

  if (!commentToBeDeleted) {
    next({ message: "", code: 204 });
    return;
  }

  try {
    const removedComment = await Comment.findOneAndRemove({ _id: commentID });
    await removedComment.remove();

    const response = {
      _id: commentToBeDeleted._id,
      content: commentToBeDeleted.content,
      user: commentToBeDeleted.user,
      upvotes: commentToBeDeleted.upvotes,
      downvotes: commentToBeDeleted.downvotes,
      message: "Comment has been deleted"
    };

    res.status(200).json(response);
  } catch (err) {
    logger.info(err);
    const errorObject = {
      message: "Validation failed",
      errors: err.errors,
      code: 400
    };
    next(errorObject);
  }
};

module.exports.upvote = async function(req, res, next) {
  const commentID = req.params.id;
  const username = req.body.username;

  let comment;
  try {
    comment = await Comment.findOne({ _id: req.params.id });
  } catch (err) {
    next({ message: "", code: 204 });
    return;
  }

  if (!comment) {
    next({ message: "", code: 204 });
    return;
  }

  try {
    const voter = await User.findOne({ name: username });

    if (!voter) {
      next({ message: "", code: 204 });
      return;
    }

    // Remove user from downvote list if necessary
    await Comment.updateOne(
      { _id: commentID },
      { $pull: { downvote_users: voter._id } }
    );
    const CommentFromDB = await Comment.findOne({ _id: commentID });

    if (!CommentFromDB) {
      next({ message: "", code: 204 });
      return;
    }

    if (!CommentFromDB.upvote_users.includes(voter._id)) {
      CommentFromDB.upvote_users.push(voter);
    }
    await CommentFromDB.save();

    const response = {
      _id: CommentFromDB._id,
      title: CommentFromDB.title,
      content: CommentFromDB.content,
      original_poster: req.body.username,
      comments: CommentFromDB.comments,
      upvotes: CommentFromDB.upvotes,
      downvotes: CommentFromDB.downvotes
    };

    res.status(200).json(response);
  } catch (err) {
    logger.info(err);
    const errorObject = {
      message: err._message,
      errors: err.errors,
      code: 400
    };
    next(errorObject);
  }
};

module.exports.downvote = async function(req, res, next) {
  const commentID = req.params.id;
  const username = req.body.username;

  let comment;
  try {
    comment = await Comment.findOne({ _id: req.params.id });
  } catch (err) {
    next({ message: "", code: 204 });
    return;
  }

  if (!comment) {
    next({ message: "", code: 204 });
    return;
  }

  try {
    const voter = await User.findOne({ name: username });

    if (!voter) {
      next({ message: "", code: 204 });
      return;
    }

    // Remove user from upvote list if necessary
    await Comment.updateOne(
      { _id: commentID },
      { $pull: { upvote_users: voter._id } }
    );
    const CommentFromDB = await Comment.findOne({ _id: commentID });

    if (!CommentFromDB) {
      next({ message: "", code: 204 });
      return;
    }

    if (!CommentFromDB.downvote_users.includes(voter._id)) {
      CommentFromDB.downvote_users.push(voter);
    }
    await CommentFromDB.save();

    const response = {
      _id: CommentFromDB._id,
      title: CommentFromDB.title,
      content: CommentFromDB.content,
      original_poster: req.body.username,
      comments: CommentFromDB.comments,
      upvotes: CommentFromDB.upvotes,
      downvotes: CommentFromDB.downvotes
    };
    res.status(200).json(response);
  } catch (err) {
    logger.info(err);
    const errorObject = {
      message: err._message,
      errors: err.errors,
      code: 400
    };
    console.log(errorObject);
    next(errorObject);
  }
};
