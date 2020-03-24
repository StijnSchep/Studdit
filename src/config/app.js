const express = require("express");
const app = express();

const logger = require("./appconfig").logger;
const bodyParser = require("body-parser");

// routers
const UserRouter = require("../routes/user.route");
const FriendshipRouter = require("../routes/friendship.route");
const ThreadRouter = require("../routes/thread.route");
const CommentRouter = require("../routes/comment.route");

// Express additions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Request handling
app.all("*", (req, res, next) => {
  logger.trace("attempt to connect with an API endpoint");

  next();
});

// Route definitions
app.use("/api/user", UserRouter);
app.use("/api/friendship", FriendshipRouter);
app.use("/api/thread", ThreadRouter);
app.use("/api/comment", CommentRouter);

// No endpoint found
app.use("*", (req, res, next) => {
  logger.trace("failed attempt: no endpoint was found");
  const errorObject = {
    message: "Endpoint not found",
    code: 404
  };

  next(errorObject);
});

// Error handler
app.use((error, req, res, next) => {
  logger.info("error handler: " + error.message);
  res.status(error.code).json(error);
});

module.exports = app;
