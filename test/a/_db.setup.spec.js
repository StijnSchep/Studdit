const logger = require("../../src/config/appconfig").logger;

const mongoose = require("mongoose");

// open a connection to the test database (don't use production database!)
before(function(done) {
  // If a database password is set, use remote testing database
  // Otherwise, use local test database
  let connectionString;
  if (process.env.MONGOTEST) {
    logger.info("Testing: Connecting to remote database...");
    connectionString = `mongodb+srv://admin:${process.env.MONGOTEST}@studdit-test-zuher.azure.mongodb.net/test?retryWrites=true&w=majority`;
  } else {
    logger.info("Testing: Connecting to local database...");
    connectionString = "mongodb://localhost/studdit_test";
  }
  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then(() => {
      logger.info("Testing: Connected to database!");
      done();
    })
    .catch(err => {
      logger.info("Testing: Database connection failed!");
      done(err);
    });
});

beforeEach(function(done) {
  const { users, threads, comments } = mongoose.connection.collections;
  users
    .drop()
    .then(() => threads.drop())
    .then(() => comments.drop())
    .then(() => done())
    .catch(() => done());
});
