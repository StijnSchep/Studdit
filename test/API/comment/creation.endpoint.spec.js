const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");
const Comment = require("../../../src/models/comment.model");

describe("API - Comment creation", function() {
  let creator;
  let thread;
  let comment;

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

    const commentProperties = {
      content: "Nice post",
      user: creator
    };

    comment = new Comment(commentProperties);
    await comment.save();
  });

  it("Should send status 400 when details are missing", async function() {
    const res = await requester
      .post(`/api/thread/${thread._id.toString()}/comment`)
      .send({});

    expect(res).to.have.status(400);
    expect(res).to.have.property("body");
    expect(res.body)
      .to.have.property("message")
      .that.equals("comment validation failed");
  });

  it("Should send status 200 when details are complete", async function() {
    const commentProperties = {
      username: creator.name,
      content: "Nice Post!"
    };

    const res = await requester
      .post(`/api/thread/${thread._id.toString()}/comment`)
      .send(commentProperties);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("content")
      .that.equals(commentProperties.content);
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
      .that.equals(commentProperties.content);
    expect(ThreadFromDB.comments[0])
      .to.have.property("user")
      .that.has.a.property("name")
      .that.equals(creator.name);
  });

  it("Should send status 400 when details are missing on subcomment", async function() {
    const commentProperties = {
      username: null,
      content: "nice comment"
    };
    const res = await requester
      .post(`/api/comment/${comment._id.toString()}/comment`)
      .send(commentProperties);

    expect(res).to.have.status(400);
    expect(res).to.have.property("body");
    expect(res.body)
      .to.have.property("message")
      .that.equals("comment validation failed");
  });

  it("Should send status 200 when details are complete on subcomment", async function() {
    const commentProperties = {
      username: creator.name,
      content: "Nice comment!"
    };

    const subComment = new Comment({ user: creator, content: "Nice comment!" });
    await subComment.save();

    const res = await requester
      .post(`/api/comment/${comment._id.toString()}/comment`)
      .send(commentProperties);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("content")
      .that.equals(commentProperties.content);
    expect(res.body)
      .to.have.property("user")
      .that.equals(creator.name);

    // checking if main comment has subcomment
    const CommentFromDB = await Comment.findOne({ _id: comment._id });

    expect(CommentFromDB)
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(1);
    expect(CommentFromDB.comments[0])
      .to.have.property("content")
      .that.equals(commentProperties.content);
    expect(CommentFromDB.comments[0])
      .to.have.property("user")
      .that.has.a.property("name")
      .that.equals(creator.name);
  });

  it("Should send status 204 when thread ID is invalid", async function() {
    const res = await requester.post("/api/thread/unknown/comment").send({});

    expect(res).to.have.status(204);
  });

  it("Should send status 204 when comment ID is invalid", async function() {
    const res = await requester.post("/api/comment/unknown/comment").send({});

    expect(res).to.have.status(204);
  });
});
