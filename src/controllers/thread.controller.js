const logger = require("../config/appconfig").logger;

const Thread = require("../models/thread.model");
const Comment = require("../models/comment.model");
const User = require("../models/user.model");

module.exports.create = async function(req, res, next) {
  /*
        Body: 
        {
            title: <e.g. "my new car">,
            content: <e.g. "Please like">,
            username: <e.g. "MyName">
        }
    */
  const user = await User.findOne({ name: req.body.username });

  if (!user) {
    next({ message: "", code: 204 });
    return;
  }

  const properties = {
    title: req.body.title,
    content: req.body.content,
    user: user
  };
  try {
    const thread = new Thread(properties);
    await thread.save();

    const response = {
      _id: thread._id,
      title: thread.title,
      content: thread.content,
      original_poster: req.body.username,
      comments: thread.comments,
      upvotes: thread.upvotes,
      downvotes: thread.downvotes
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

module.exports.update = async function(req, res, next) {
  const threadID = req.params.id;
  const content = req.body.content;

  let thread;
  try {
    thread = await Thread.findOne({ _id: req.params.id });
  } catch (err) {
    next({ message: "", code: 204 });
    return;
  }

  if (!thread) {
    next({ message: "", code: 204 });
    return;
  }

  await Thread.updateOne({ _id: threadID }, { $set: { content: content } });
  thread = await Thread.findOne({ _id: threadID });

  const response = {
    _id: thread._id,
    title: thread.title,
    content: thread.content,
    original_poster: req.body.username,
    comments: thread.comments,
    upvotes: thread.upvotes,
    downvotes: thread.downvotes,
    message: "Thread has been updated"
  };

  res.status(200).json(response);
};

// TODO: Delete comments with thread
module.exports.delete = async function(req, res, next) {
  let thread;
  try {
    thread = await Thread.findOne({ _id: req.params.id });
  } catch (err) {
    next({ message: "", code: 204 });
    return;
  }

  if (!thread) {
    next({ message: "", code: 204 });
    return;
  }

  try {
    const removedThread = await Thread.findOneAndRemove({ _id: thread._id });
    await removedThread.remove();

    const response = {
      _id: thread._id,
      content: thread.content,
      user: thread.user,
      upvotes: thread.upvotes,
      downvotes: thread.downvotes,
      message: "Thread has been deleted"
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

module.exports.get = async function(req, res, next) {
  const id = req.params.id;
  let ThreadFromDB;
  try {
    ThreadFromDB = await Thread.findOne({ _id: id });
  } catch (err) {
    // id cannot be cast to ObjectId
    const errorObject = {
      message: "Thread not found",
      code: 404
    };
    next(errorObject);
    return;
  }

  if (ThreadFromDB) {
    let response = {
      _id: ThreadFromDB._id.toString(),
      title: ThreadFromDB.title,
      content: ThreadFromDB.content,
      user: ThreadFromDB.user,
      upvotes: ThreadFromDB.upvotes,
      downvotes: ThreadFromDB.downvotes,
      comment_count: ThreadFromDB.comment_count,
      comments: ThreadFromDB.comments
    };

    res.status(200).json(response);
  } else {
    const errorObject = {
      message: "Thread not found",
      code: 404
    };
    next(errorObject);
  }
};

module.exports.list = async function(req, res, next) {
  const sortBy = req.query.sortBy;
  const filter = req.query.filter;
  const user = req.query.user;
  const depth = req.query.depth;

  let response;
  if (filter === "friends" && user && depth > 0) {
    const userFromDB = await User.findOne({ name: user });
    if (!userFromDB) {
      const errorObject = {
        message: "Parameter user is unknown",
        code: 400
      };
      next(errorObject);
      return;
    }

    response = await getThreadsByFriends(userFromDB._id, depth);
  } else {
    response = await getAllThreads();
  }

  if (!sortBy || sortBy === "none") {
    logger.info("Querying thread list with no sorting");
  }

  if (sortBy === "upvotes") {
    logger.info("Querying thread list with upvote sorting");
    response.sort(compareUpvotes);
  }

  if (sortBy === "votedif") {
    logger.info("Querying thread list with votedif sorting");
    response.sort(compareVotedif);
  }

  if (sortBy === "comments") {
    response.sort(compareCommentCount);
  }

  res.status(200).json(response);
};

async function getThreadsByFriends(id, depth) {
  const friendList = await getFriendList(id, depth);
  let threads = await Thread.find({ user: { $in: friendList } });
  return await createThreadResponseList(threads);
}

async function getAllThreads() {
  let threads = await Thread.find({});

  return await createThreadResponseList(threads);
}

async function createThreadResponseList(threads) {
  let response = [];
  for (let i = 0; i < threads.length; i++) {
    let user = await User.findOne({ _id: threads[i].user._id });
    let responseItem = {
      _id: threads[i]._id,
      original_poster: user.name,
      title: threads[i].title,
      content: threads[i].content,
      comment_count: threads[i].comment_count,
      upvotes: threads[i].upvotes,
      downvotes: threads[i].downvotes
    };
    response.push(responseItem);
  }

  return response;
}

async function getFriendList(id, depth) {
  const NeoSession = require("../config/neo4j.session");
  const res = await NeoSession.run(`MATCH(user:User {id: "${id}"})-[:FRIEND_WITH*1..${depth}]->(friend:User)
  WHERE friend <> user
  RETURN DISTINCT friend.id AS name`);

  let response = [];
  res.records.forEach(record => {
    response.push(record._fields[0]);
  });

  return response;
}

function compareUpvotes(a, b) {
  return b.upvotes - a.upvotes;
}

function compareVotedif(a, b) {
  const voteDifA = a.upvotes - a.downvotes;
  const voteDifB = b.upvotes - b.downvotes;

  return voteDifB - voteDifA;
}

function compareCommentCount(a, b) {
  return b.comment_count - a.comment_count;
}

module.exports.upvote = async function(req, res, next) {
  const threadId = req.params.id;
  const username = req.body.username;

  const voter = await User.findOne({ name: username });

  if (!voter) {
    next({ message: "", code: 204 });
    return;
  }

  // Remove user from downvote list if necessary
  await Thread.updateOne(
    { _id: threadId },
    { $pull: { downvote_users: voter._id } }
  );
  const ThreadFromDB = await Thread.findOne({ _id: threadId });

  if (!ThreadFromDB) {
    next({ message: "", code: 204 });
    return;
  }

  if (!ThreadFromDB.upvote_users.includes(voter._id)) {
    ThreadFromDB.upvote_users.push(voter);
  }
  await ThreadFromDB.save();

  const response = {
    _id: ThreadFromDB._id,
    title: ThreadFromDB.title,
    content: ThreadFromDB.content,
    original_poster: req.body.username,
    comments: ThreadFromDB.comments,
    upvotes: ThreadFromDB.upvotes,
    downvotes: ThreadFromDB.downvotes
  };

  res.status(200).json(response);
};

module.exports.downvote = async function(req, res, next) {
  const threadId = req.params.id;
  const username = req.body.username;

  const voter = await User.findOne({ name: username });

  if (!voter) {
    next({ message: "", code: 204 });
    return;
  }

  // Remove user from downvote list if necessary
  await Thread.updateOne(
    { _id: threadId },
    { $pull: { upvote_users: voter._id } }
  );
  const ThreadFromDB = await Thread.findOne({ _id: threadId });

  if (!ThreadFromDB.downvote_users.includes(voter._id)) {
    ThreadFromDB.downvote_users.push(voter);
  }
  await ThreadFromDB.save();

  if (!ThreadFromDB) {
    next({ message: "", code: 204 });
    return;
  }

  const response = {
    _id: ThreadFromDB._id,
    title: ThreadFromDB.title,
    content: ThreadFromDB.content,
    original_poster: req.body.username,
    comments: ThreadFromDB.comments,
    upvotes: ThreadFromDB.upvotes,
    downvotes: ThreadFromDB.downvotes
  };

  res.status(200).json(response);
};

// Add comment to thread
module.exports.addComment = async function(req, res, next) {
  /*
        Body: 
        {
            content:    <e.g. "nice post">,
            username:   <e.g. "MyName">
        }
    */
  const user = await User.findOne({ name: req.body.username });

  let thread;
  try {
    thread = await Thread.findOne({ _id: req.params.id });
  } catch (err) {
    next({ message: "", code: 204 });
    return;
  }

  if (!thread) {
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

    const threadToBeUpdated = await Thread.findOne({ _id: thread._id });
    threadToBeUpdated.comments.push(comment);

    await threadToBeUpdated.save();

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
