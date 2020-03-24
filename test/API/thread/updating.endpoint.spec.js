const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");

describe("API - Thread updating", function() {
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

  it("Should return status 200 when updating thread", async function() {
    const body = {
      content: "New content"
    };

    const res = await requester.put("/api/thread/" + thread._id).send(body);
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("content")
      .that.equals("New content");
  });

  it("Should return status 204 when not providing an id", async function() {
    const body = {
      content: "New content"
    };

    const res = await requester.put("/api/thread/").send(body);
    expect(res).to.have.status(204);
  });

  it("Should return status 204 when providing an invalid ID", async function() {
    const body = {
      content: "New content"
    };

    const res = await requester.put("/api/thread/unknown").send(body);
    expect(res).to.have.status(204);
  });

  it("Should add a comment to a thread", async function() {
    const comment = {
      username: creator.name,
      content: "Nice Post!"
    };

    const res = await requester
      .post(`/api/thread/${thread._id.toString()}/comment`)
      .send(comment);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("content")
      .that.equals(comment.content);
    expect(res.body)
      .to.have.property("user")
      .that.equals(creator.name);

    const ThreadFromDB = await Thread.findOne({ _id: thread._id.toString() });
    expect(ThreadFromDB)
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(1);
    expect(ThreadFromDB.comments[0])
      .to.have.property("content")
      .that.equals(comment.content);
    expect(ThreadFromDB.comments[0])
      .to.have.property("user")
      .that.has.a.property("name")
      .that.equals(creator.name);
  });
});
