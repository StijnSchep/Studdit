const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Thread = require("../../../src/models/thread.model");
const Comment = require("../../../src/models/comment.model");

describe("API - Comment deleting", function() {
  let creator;
  let thread;
  let comment;
  let subComment;

  this.beforeEach(async function() {
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

    subComment = new Comment(commentProperties);
    comment.comments.push(subComment);

    await subComment.save();
    await comment.save();
  });

  it("Should send status 204 when ID is invalid", async function() {
    const fakeCommentID = "12346789";
    const res = await requester
      .delete(`/api/comment/${fakeCommentID}`)
      .send({});

    expect(res).to.have.status(204);
  });

  it("Should send status 200 when details are complete", async function() {
    const res = await requester
      .delete(`/api/comment/${comment._id.toString()}`)
      .send({});

    console.log(res.body);

    expect(res).to.have.status(200);
    expect(res).to.have.property("body");
    expect(res.body)
      .to.have.property("message")
      .that.equals("Comment has been deleted");
  });

  it("Should send status 200 when details are complete on subdocument", async function() {
    const res = await requester
      .delete(`/api/comment/${subComment._id.toString()}`)
      .send({});

    expect(res).to.have.status(200);
    expect(res).to.have.property("body");
    expect(res.body)
      .to.have.property("message")
      .that.equals("Comment has been deleted");

    const CommentFromDB = await Comment.findOne({ _id: comment._id });

    expect(CommentFromDB)
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(0);
  });
});
