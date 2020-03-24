const mongoose = require("mongoose");
const logger = require("./src/config/appconfig").logger;

const app = require("./src/config/app");

// since app inherits from Event Emitter, we can use this to get the app started
// after the database is connected
app.on("mongooseConnected", function() {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    logger.info(`server is listening on port ${PORT}`);
  });
});

let connectionString;
if (process.env.MONGO) {
  logger.info("Production: Connecting to remote database...");
  connectionString = `mongodb+srv://Admin:${process.env.MONGO}@studdit-j5qfv.azure.mongodb.net/test?retryWrites=true&w=majority`;
} else {
  logger.info("Development: Connecting to local database...");
  connectionString = "mongodb://localhost/studdit";
}

// connect to the database
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    logger.info("MongoDB connection established");

    // fire the event that the app is ready to listen
    app.emit("mongooseConnected");
  })
  .catch(err => {
    logger.error("MongoDB connection failed");
    logger.error(err);
  });
