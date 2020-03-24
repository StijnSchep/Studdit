const logger = require("../config/appconfig").logger;
const NeoSession = require("../config/neo4j.session");

const User = require("../models/user.model");

// POST /api/friendship {user_one, user_two}
module.exports.add = async function(req, res, next) {
  const user_one = await User.findOne({ name: req.body.user_one });
  const user_two = await User.findOne({ name: req.body.user_two });

  if (!user_one) {
    const errorObject = {
      message: "Body does not contain an existing user_one",
      code: 400
    };
    next(errorObject);
    NeoSession.close();
    return;
  }

  if (!user_two) {
    const errorObject = {
      message: "Body does not contain an existing user_two",
      code: 400
    };
    next(errorObject);
    NeoSession.close();
    return;
  }

  NeoSession.run(
    `MERGE (user1:User {id:"${user_one._id}"})
        MERGE (user2:User {id: "${user_two._id}"})
        MERGE (user1)-[:FRIEND_WITH]->(user2)
        MERGE (user2)-[:FRIEND_WITH]->(user1)
        RETURN user1, user2`
  )
    .then(() => {
      res.status(200).json({ message: "Friendship successfully created" });
      NeoSession.close();
    })
    .catch(error => {
      const errorObject = {
        message: "Something went wrong when creating friends!",
        error: error,
        code: 500
      };
      next(errorObject);
      NeoSession.close();
    });
};

// DELETE /api/friendship/first/second
module.exports.remove = async function(req, res, next) {
  const user_one = await User.findOne({ name: req.params.first });
  const user_two = await User.findOne({ name: req.params.second });

  if (!user_one) {
    const errorObject = {
      message: "First parameter user is unknown",
      code: 400
    };
    next(errorObject);
    NeoSession.close();
    return;
  }

  if (!user_two) {
    const errorObject = {
      message: "Second parameter user is unknown",
      code: 400
    };
    next(errorObject);
    NeoSession.close();
    return;
  }

  NeoSession.run(
    `MATCH(user1:User {id: "${user_one._id}"}), (user2:User {id: "${user_two._id}"})
        MATCH(user1)-[r1:FRIEND_WITH]->(user2), (user2)-[r2:FRIEND_WITH]->(user1)
        DELETE r1, r2`
  )
    .then(() => {
      res.status(200).json({ message: "Friendship successfully removed" });
      NeoSession.close();
    })
    .catch(error => {
      const errorObject = {
        message: "Something went wrong when deleting friends!",
        error: error,
        code: 500
      };
      next(errorObject);
      NeoSession.close();
    });
};
