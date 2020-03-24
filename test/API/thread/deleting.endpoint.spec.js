const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");

describe("API - Thread deleting", function() {
  let creator;
  let thread;

  beforeEach(async function() {
    creator = new User({ name: "ExistingUser", password: "ExistingPass" });
    await creator.save();

    const properties = {
      title: "Original title",
      content: "Original content",
      user: creator
    };
    thread = new Thread(properties);
    await thread.save();
  });

  it("Should return status 200 when deleting a thread", async function() {
    const res = await requester.delete("/api/thread/" + thread._id).send({});
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Thread has been deleted");
  });

  it("Should return status 204 when not providing an id", async function() {
    const res = await requester.delete("/api/thread/").send({});
    expect(res).to.have.status(204);
  });
});
