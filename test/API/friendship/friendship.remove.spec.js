const chai = require("chai");
const expect = chai.expect;

const logger = require("../../../src/config/appconfig").logger;
const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");

describe("API - Friendship removal", function() {
  let userOne;
  let userTwo;

  beforeEach(async function() {
    userOne = new User({ name: "UserOne", password: "Pass" });
    userTwo = new User({ name: "UserTwo", password: "Pass" });
    await userOne.save();
    await userTwo.save();

    const NeoSession = require("../../../src/config/neo4j.session");
    await NeoSession.run(
      "MATCH (user:User)-[r:FRIEND_WITH]->(friend:User) DELETE r,user,friend"
    );
    await NeoSession.run(`MERGE (user1:User {id:"${userOne._id}"})
        MERGE (user2:User {id: "${userTwo._id}"})
        MERGE (user1)-[:FRIEND_WITH]->(user2)
        MERGE (user2)-[:FRIEND_WITH]->(user1)
        RETURN user1, user2`);
    NeoSession.close();
  });

  it("Should remove a friendship between two users", async function() {
    const NeoSession = require("../../../src/config/neo4j.session");

    const res = await requester
      .delete(`/api/friendship/${userOne.name}/${userTwo.name}`)
      .send({});
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Friendship successfully removed");

    const NeoResult = await NeoSession.run(
      `MATCH (user:User)-[:FRIEND_WITH]->(friend:User) RETURN DISTINCT user,friend`
    );
    expect(NeoResult).to.have.property("records");
    expect(NeoResult.records).to.be.an.array();
    expect(NeoResult.records).to.be.ofSize(0);
  });

  it("Should return status 400 when first user does not exist", async function() {
    const NeoSession = require("../../../src/config/neo4j.session");

    const res = await requester
      .delete(`/api/friendship/NonExistent/${userTwo.name}`)
      .send({});
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("First parameter user is unknown");

    const NeoResult = await NeoSession.run(
      `MATCH (user:User)-[:FRIEND_WITH]->(friend:User) RETURN DISTINCT user,friend`
    );
    expect(NeoResult).to.have.property("records");
    expect(NeoResult.records).to.be.an.array();
    expect(NeoResult.records).to.be.ofSize(2);
  });

  it("Should return status 400 when second user does not exist", async function() {
    const NeoSession = require("../../../src/config/neo4j.session");

    const res = await requester
      .delete(`/api/friendship/${userOne.name}/NonExistent`)
      .send({});
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Second parameter user is unknown");

    const NeoResult = await NeoSession.run(
      `MATCH (user:User)-[:FRIEND_WITH]->(friend:User) RETURN DISTINCT user,friend`
    );
    expect(NeoResult).to.have.property("records");
    expect(NeoResult.records).to.be.an.array();
    expect(NeoResult.records).to.be.ofSize(2);
  });

  it("Should return status 200 when there was no friendship to remove", async function() {
    const NeoSession = require("../../../src/config/neo4j.session");

    await requester
      .delete(`/api/friendship/${userOne.name}/${userTwo.name}`)
      .send({});
    const res = await requester
      .delete(`/api/friendship/${userOne.name}/${userTwo.name}`)
      .send({});
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Friendship successfully removed");

    const NeoResult = await NeoSession.run(
      `MATCH (user:User)-[:FRIEND_WITH]->(friend:User) RETURN DISTINCT user,friend`
    );
    expect(NeoResult).to.have.property("records");
    expect(NeoResult.records).to.be.an.array();
    expect(NeoResult.records).to.be.ofSize(0);
  });
});
