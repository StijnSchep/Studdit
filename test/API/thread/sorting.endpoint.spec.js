const chai = require("chai");
const expect = chai.expect;
const assertArrays = require("chai-arrays");
chai.use(assertArrays);

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");
const Comment = require("../../../src/models/comment.model");

describe("API - Thread sorting", function() {
  let thread1;
  let thread2;
  let thread3;

  beforeEach(async function() {
    const creator = await new User({
      name: "ExistingUser",
      password: "ExistingPass"
    }).save();
    const voter1 = await new User({
      name: "Voter1",
      password: "ExistingPass"
    }).save();
    const voter2 = await new User({
      name: "Voter2",
      password: "ExistingPass"
    }).save();
    const voter3 = await new User({
      name: "Voter3",
      password: "ExistingPass"
    }).save();
    const voter4 = await new User({
      name: "Voter4",
      password: "ExistingPass"
    }).save();
    const voter5 = await new User({
      name: "Voter5",
      password: "ExistingPass"
    }).save();
    const voter6 = await new User({
      name: "Voter6",
      password: "ExistingPass"
    }).save();

    const comment1 = new Comment({ user: voter1, content: "Nice!" });
    const comment2 = new Comment({ user: voter2, content: "Alright!" });
    const comment3 = new Comment({ user: voter3, content: "Oke" });
    await Promise.all([comment1.save(), comment2.save(), comment3.save()]);

    const thread1prop = {
      title: "Thread1",
      content: "Original content",
      user: creator
    };
    thread1 = new Thread(thread1prop);
    thread1.upvote_users.push(voter1);
    await thread1.save();

    const thread2prop = {
      title: "Thread2",
      content: "Original content",
      user: creator
    };
    thread2 = new Thread(thread2prop);
    thread2.upvote_users.push(voter1);
    thread2.upvote_users.push(voter2);
    thread2.upvote_users.push(voter3);
    thread2.downvote_users.push(voter4);
    thread2.downvote_users.push(voter5);
    thread2.downvote_users.push(voter6);
    thread2.comments.push(comment3);
    await thread2.save();

    const thread3prop = {
      title: "Thread3",
      content: "Original content",
      user: creator
    };
    thread3 = new Thread(thread3prop);
    thread3.upvote_users.push(voter1);
    thread3.upvote_users.push(voter2);
    thread3.comments.push(comment1);
    thread3.comments.push(comment2);
    await thread3.save();
  });

  it("Should list threads 1-2-3 when sortBy is not specified", async function() {
    const res = await requester.get("/api/thread/list").send({});
    expect(res).to.have.status(200);
    expect(res.body).to.be.array();

    expect(res.body).to.be.ofSize(3);
    expect(res.body[0])
      .to.have.property("_id")
      .that.equals(thread1._id.toString());
    expect(res.body[1])
      .to.have.property("_id")
      .that.equals(thread2._id.toString());
    expect(res.body[2])
      .to.have.property("_id")
      .that.equals(thread3._id.toString());
  });

  it("Should list threads 1-2-3 when sortBy is set to none", async function() {
    const res = await requester.get("/api/thread/list?sortBy=none").send({});
    expect(res).to.have.status(200);
    expect(res.body).to.be.array();

    expect(res.body).to.be.ofSize(3);
    expect(res.body[0])
      .to.have.property("_id")
      .that.equals(thread1._id.toString());
    expect(res.body[1])
      .to.have.property("_id")
      .that.equals(thread2._id.toString());
    expect(res.body[2])
      .to.have.property("_id")
      .that.equals(thread3._id.toString());
  });

  it("Should list threads 2-3-1 when sortBy is set to upvotes", async function() {
    const res = await requester.get("/api/thread/list?sortBy=upvotes").send({});
    expect(res).to.have.status(200);
    expect(res.body).to.be.array();

    expect(res.body).to.be.ofSize(3);
    expect(res.body[0])
      .to.have.property("_id")
      .that.equals(thread2._id.toString());
    expect(res.body[1])
      .to.have.property("_id")
      .that.equals(thread3._id.toString());
    expect(res.body[2])
      .to.have.property("_id")
      .that.equals(thread1._id.toString());
  });

  it("Should list threads 3-1-2 when sortBy is set to votedif", async function() {
    const res = await requester.get("/api/thread/list?sortBy=votedif").send({});
    expect(res).to.have.status(200);
    expect(res.body).to.be.array();

    expect(res.body).to.be.ofSize(3);
    expect(res.body[0])
      .to.have.property("_id")
      .that.equals(thread3._id.toString());
    expect(res.body[1])
      .to.have.property("_id")
      .that.equals(thread1._id.toString());
    expect(res.body[2])
      .to.have.property("_id")
      .that.equals(thread2._id.toString());
  });

  it("Should list threads 3-2-1 when sortBy is set to comments", async function() {
    const res = await requester
      .get("/api/thread/list?sortBy=comments")
      .send({});
    expect(res).to.have.status(200);
    expect(res.body).to.be.array();

    expect(res.body).to.be.ofSize(3);
    expect(res.body[0])
      .to.have.property("_id")
      .that.equals(thread3._id.toString());
    expect(res.body[1])
      .to.have.property("_id")
      .that.equals(thread2._id.toString());
    expect(res.body[2])
      .to.have.property("_id")
      .that.equals(thread1._id.toString());
  });
});
