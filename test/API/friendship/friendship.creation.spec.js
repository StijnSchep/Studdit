const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");

describe("API - Friendship creation", function() {
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
    NeoSession.close();
  });

  it("Should create a friendship between two users", async function() {
    const NeoSession = require("../../../src/config/neo4j.session");

    const res = await requester.post("/api/friendship").send({
      user_one: userOne.name,
      user_two: userTwo.name
    });

    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Friendship successfully created");

    const NeoResult = await NeoSession.run(
      `MATCH (user:User)-[:FRIEND_WITH]->(friend:User) RETURN DISTINCT user,friend`
    );
    expect(NeoResult).to.have.property("records");
    expect(NeoResult.records).to.be.an.array();
    expect(NeoResult.records).to.be.ofSize(2);

    // Check if the neo4j database has friendship relations going in two directions
    expect(NeoResult.records[0])
      .to.have.property("_fields")
      .that.is.an.array()
      .ofSize(2);
    NeoSession.close();
  });

  it("Should return status 400 when first user does not exist", async function() {
    const NeoSession = require("../../../src/config/neo4j.session");

    const res = await requester.post("/api/friendship").send({
      user_one: "NonExistent",
      user_two: userTwo.name
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Body does not contain an existing user_one");

    // No relationship should have been created
    const NeoResult = await NeoSession.run(
      `MATCH (user:User)-[:FRIEND_WITH]->(friend:User) RETURN DISTINCT user,friend`
    );
    expect(NeoResult).to.have.property("records");
    expect(NeoResult.records).to.be.an.array();
    expect(NeoResult.records).to.be.ofSize(0);
  });

  it("Should return status 400 when second user does not exist", async function() {
    const NeoSession = require("../../../src/config/neo4j.session");

    const res = await requester.post("/api/friendship").send({
      user_one: userOne.name,
      user_two: "NonExistent"
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Body does not contain an existing user_two");

    // No relationship should have been created
    const NeoResult = await NeoSession.run(
      `MATCH (user:User)-[:FRIEND_WITH]->(friend:User) RETURN DISTINCT user,friend`
    );
    expect(NeoResult).to.have.property("records");
    expect(NeoResult.records).to.be.an.array();
    expect(NeoResult.records).to.be.ofSize(0);
  });
});
