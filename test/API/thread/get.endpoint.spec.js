const chai = require("chai");
const expect = chai.expect;
const assertArrays = require("chai-arrays");
chai.use(assertArrays);

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");
const Comment = require("../../../src/models/comment.model");

describe("API - Get single thread by ID", function() {
  let creator;
  let commenter;
  let thread;
  let subcomment;
  let comment;

  this.beforeEach(async function() {
    creator = new User({ name: "ExistingUser", password: "ExistingPass" });
    commenter = new User({ name: "Commenter", password: "Pass" });
    await Promise.all([creator.save(), commenter.save()]);

    subcomment = new Comment({ user: commenter, content: "Really Nice!" });
    comment = new Comment({ user: commenter, content: "Nice Post!" });
    await subcomment.save();
    comment.comments.push(subcomment);
    await comment.save();

    const properties = {
      title: "Original title",
      content: "Original content",
      user: creator
    };
    thread = new Thread(properties);
    thread.comments.push(comment);
    await thread.save();
  });

  it("Should return status 404 if thread does not exist", async function() {
    const res = await requester.get("/api/thread/unknown");

    expect(res).to.have.status(404);
    expect(res.body)
      .to.have.a.property("message")
      .that.equals("Thread not found");
  });

  it("Should return a thread with comments and subcomments", async function() {
    const res = await requester.get("/api/thread/" + thread._id.toString());

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("_id");
    expect(res.body._id.toString()).to.equal(thread._id.toString());
    expect(res.body)
      .to.have.property("comment_count")
      .that.equals(2);
    expect(res.body)
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(1);
    expect(res.body.comments[0])
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(1);
  });
});
