const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");

describe("API - Thread creation", function() {
  let creator;

  beforeEach(done => {
    creator = new User({ name: "ExistingUser", password: "ExistingPass" });
    creator.save().then(() => done());
  });

  it("Should send status 204 when details are missing", async function() {
    const res = await requester.post("/api/thread").send({});

    expect(res).to.have.status(204);
  });

  it("Should send status 204 when user does not exist", async function() {
    const res = await requester
      .post("/api/thread")
      .send({ username: "unknown" });

    expect(res).to.have.status(204);
  });

  it("Should send status 400 only user is given", async function() {
    const res = await requester
      .post("/api/thread")
      .send({ username: creator.name });
    expect(res).to.have.status(400);
  });

  it("Should send status 200 when details are complete", async function() {
    const properties = {
      title: "Some title here",
      content: "Some content here",
      username: creator.name
    };

    const res = await requester.post("/api/thread").send(properties);
    expect(res).to.have.status(200);
    expect(res).to.have.property("body");
    expect(res.body)
      .to.have.property("original_poster")
      .that.equals(creator.name);
    expect(res.body).to.have.property("comments");
    expect(res.body)
      .to.have.property("upvotes")
      .that.equals(0);
    expect(res.body)
      .to.have.property("downvotes")
      .that.equals(0);

    const ThreadFromDB = await Thread.findOne({ _id: res.body._id });
    expect(ThreadFromDB).to.not.be.null;
    expect(ThreadFromDB).to.have.property("user");
  });
});
