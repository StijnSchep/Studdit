var neo4j = require("neo4j-driver").v1;
var logger = require("./appconfig").logger;

let connectionString;
let user;
let pass;
if (process.env.NEO4JUSER && process.env.NEO4JPASS && process.env.NEO4JSTRING) {
  connectionString = process.env.NEO4JSTRING;
  user = process.env.NEO4JUSER;
  pass = process.env.NEO4JPASS;
} else {
  // No NEO4j credentials specified, try to connect to local test database
  logger.info("Connecting to local Neo4j Database");
  connectionString = "bolt://localhost";
  user = "neo4j";
  pass = "1234";
}
var driver = neo4j.driver(connectionString, neo4j.auth.basic(user, pass));
module.exports = driver.session();
