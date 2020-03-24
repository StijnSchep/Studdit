const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Comment = require("../../../src/models/comment.model");
const User = require("../../../src/models/user.model");

describe("Comment Voting", function() {
  let creator;
  let voter;
  let comment;

  beforeEach(async function() {
    creator = new User({ name: "CommentCreator", password: "CreatorPass" });
    voter = new User({ name: "Voter", password: "VoterPass" });
    await creator.save();
    await voter.save();

    const properties = {
      content: "Some content here",
      user: creator
    };
    comment = new Comment(properties);
    await comment.save();
  });

  it("Should let a user upvote a comment", async function() {
    const CommentFromDB = await Comment.findOne({ _id: comment._id });
    CommentFromDB.upvote_users.push(voter);
    await CommentFromDB.save();

    expect(CommentFromDB)
      .to.have.property("upvotes")
      .that.equals(1);
    expect(CommentFromDB)
      .to.have.property("downvotes")
      .that.equals(0);

    const UpdatedCommentFromDB = await Comment.findOne({ _id: comment._id });
    expect(UpdatedCommentFromDB)
      .to.have.property("upvotes")
      .that.equals(1);
    expect(UpdatedCommentFromDB)
      .to.have.property("upvote_users")
      .that.contains(voter._id);
  });

  it("Should let a user downvote a thread", async function() {
    const CommentFromDB = await Comment.findOne({ _id: comment._id });
    CommentFromDB.downvote_users.push(voter);
    await CommentFromDB.save();

    expect(CommentFromDB)
      .to.have.property("upvotes")
      .that.equals(0);
    expect(CommentFromDB)
      .to.have.property("downvotes")
      .that.equals(1);

    const UpdatedCommentFromDB = await Comment.findOne({ _id: comment._id });
    expect(UpdatedCommentFromDB)
      .to.have.property("downvotes")
      .that.equals(1);
    expect(UpdatedCommentFromDB)
      .to.have.property("downvote_users")
      .that.contains(voter._id);
  });

  it("Should let a user remove an upvote", async function() {
    const CommentFromDB = await Comment.findOne({ _id: comment._id });
    CommentFromDB.upvote_users.push(voter);
    await CommentFromDB.save();

    await Comment.updateOne(
      { _id: comment._id },
      { $pull: { upvote_users: voter._id } }
    );
    const UpdatedCommentFromDB = await Comment.findOne({ _id: comment._id });
    expect(UpdatedCommentFromDB)
      .to.have.property("upvotes")
      .that.equals(0);
    expect(UpdatedCommentFromDB)
      .to.have.property("upvote_users")
      .that.does.not.contain(voter._id);
  });

  it("Should let a user remove a downvote", async function() {
    const CommentFromDB = await Comment.findOne({ _id: comment._id });
    CommentFromDB.downvote_users.push(voter);
    await CommentFromDB.save();

    await Comment.updateOne(
      { _id: comment._id },
      { $pull: { downvote_users: voter._id } }
    );
    const UpdatedCommentFromDB = await Comment.findOne({ _id: comment._id });
    expect(UpdatedCommentFromDB)
      .to.have.property("downvotes")
      .that.equals(0);
    expect(UpdatedCommentFromDB)
      .to.have.property("downvote_users")
      .that.does.not.contain(voter._id);
  });
});
