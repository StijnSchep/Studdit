const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Thread = require("../../../src/models/thread.model");
const Comment = require("../../../src/models/comment.model");
const User = require("../../../src/models/user.model");

describe("Comment model deleting", function() {
  let commenter;
  let subcommenter;
  let thread;

  beforeEach(async function() {
    const creator = new User({ name: "Creator", password: "Pass" });
    commenter = new User({ name: "Commenter", password: "Pass" });
    subcommenter = new User({ name: "SubCommenter", password: "Pass" });
    await Promise.all([creator.save(), commenter.save(), subcommenter.save()]);

    const properties = {
      title: "Original title",
      content: "Original content",
      user: creator
    };

    thread = new Thread(properties);
    await thread.save();
  });

  it("Should delete a comment", async function() {
    // create a comment
    const comment = new Comment({
      user: commenter,
      content: "My first comment!"
    });
    await comment.save();

    // check if comment has been made.
    const commentFromDB = await Comment.findOne({
      user: commenter,
      content: "My first comment!"
    });

    // confirm comment has the right propperties
    expect(commentFromDB).to.exist;

    // delete a comment
    await Comment.deleteOne({ _id: commentFromDB._id });
    const deletedCommentFromDB = await Comment.findOne({
      _id: commentFromDB._id
    });

    // assert result
    expect(deletedCommentFromDB).to.be.null;
  });

  it("Should delete a subcomment from comment", async function() {
    // create a comment
    const comment = new Comment({
      user: commenter,
      content: "My first comment!"
    });
    await comment.save();

    // create a subcomment
    const subComment = new Comment({
      user: subcommenter,
      content: "My first subcomment!"
    });
    await subComment.save();

    // add subcomment reference in comment
    const commentToBeUpdated = await Comment.findOne({
      _id: comment._id
    });

    commentToBeUpdated.comments.push(subComment);
    await commentToBeUpdated.save();

    await Comment.deleteOne({ _id: subComment._id });
    const subCommentFromDB = await Comment.findOne({ _id: subComment._id });
    expect(subCommentFromDB).to.be.null;
  });

  it("Should fail to delete a comment without an valid commentId", async function() {
    // create a comment
    const comment = new Comment({
      user: commenter,
      content: "My first comment!"
    });
    await comment.save();

    // check comment is created
    const commentFromDB = await Comment.findOne({ _id: comment._id });
    expect(commentFromDB).to.exist;

    // delete comment without valid ID
    await expect(Comment.deleteOne({ _id: "fake_ID" })).to.be.rejected;
  });
});
