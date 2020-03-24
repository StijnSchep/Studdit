const chai = require("chai");
const expect = chai.expect;

const logger = require("../../../src/config/appconfig").logger;
const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");

describe("API - Friendship thread filtering", function() {
  let user;
  let friend1;
  let friend2;
  let enemy;

  let friend1Thread;
  let friend2Thread;
  let enemyThread;

  beforeEach(async function() {
    user = new User({ name: "User", password: "Pass" });
    friend1 = new User({ name: "Friend1", password: "Pass" });
    friend2 = new User({ name: "Friend2", password: "Pass" });
    enemy = new User({ name: "Enemy", password: "Pass" });
    await Promise.all([
      user.save(),
      friend1.save(),
      friend2.save(),
      enemy.save()
    ]);

    let properties = {
      title: "Friendly thread 1",
      content: "Original content",
      user: friend1
    };
    friend1Thread = new Thread(properties);
    properties = {
      title: "Friendly thread 2",
      content: "Original content",
      user: friend2
    };
    friend2Thread = new Thread(properties);
    properties = {
      title: "Enemy thread",
      content: "Original content",
      user: enemy
    };
    enemyThread = new Thread(properties);
    await Promise.all([
      friend1Thread.save(),
      friend2Thread.save(),
      enemyThread.save()
    ]);

    const NeoSession = require("../../../src/config/neo4j.session");
    await NeoSession.run(
      "MATCH (user:User)-[r:FRIEND_WITH]->(friend:User) DELETE r,user,friend"
    );
    await NeoSession.run(`MERGE (user1:User {id:"${user._id}"})
        MERGE (user2:User {id: "${friend1._id}"})
        MERGE (user1)-[:FRIEND_WITH]->(user2)
        MERGE (user2)-[:FRIEND_WITH]->(user1)
        RETURN user1, user2`);
    await NeoSession.run(`MERGE (user1:User {id:"${friend1._id}"})
        MERGE (user2:User {id: "${friend2._id}"})
        MERGE (user1)-[:FRIEND_WITH]->(user2)
        MERGE (user2)-[:FRIEND_WITH]->(user1)
        RETURN user1, user2`);
    NeoSession.close();
  });

  it("Should only return friendly thread 1 with friend filter and depth 1", async function() {
    const res = await requester.get(
      `/api/thread/list?filter=friends&user=${user.name}&depth=1`
    );

    expect(res).to.have.status(200);
    expect(res.body).to.be.an.array();
    expect(res.body).to.be.ofSize(1);
    expect(res.body[0]._id).to.equal(friend1Thread._id.toString());
  });

  it("Should return friendly thread 1 and 2 with friend filter and depth 2", async function() {
    const res = await requester.get(
      `/api/thread/list?filter=friends&user=${user.name}&depth=2`
    );

    expect(res).to.have.status(200);
    expect(res.body).to.be.an.array();
    expect(res.body).to.be.ofSize(2);
  });

  it("Should return status 400 when filter is set to friends and user is unknown", async function() {
    const res = await requester.get(
      `/api/thread/list?filter=friends&user=unknown&depth=1`
    );

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Parameter user is unknown");
  });
});
