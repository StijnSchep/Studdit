const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Thread = require("../../../src/models/thread.model");
const Comment = require("../../../src/models/comment.model");
const User = require("../../../src/models/user.model");

describe("Comment Model Creation", function() {
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

  it("Should save a comment", async function() {
    const comment = new Comment({ user: commenter, content: "Nice Post!" });
    await comment.save();

    const CommentFromDB = await Comment.findOne({
      user: commenter._id,
      content: "Nice Post!"
    });
    expect(CommentFromDB).to.exist;
    expect(CommentFromDB).to.have.property("_id");
    expect(CommentFromDB._id.toString()).to.equal(comment._id.toString());
    expect(CommentFromDB)
      .to.have.property("comments")
      .that.is.an.array();
    expect(CommentFromDB.comments).to.be.ofSize(0);
    expect(CommentFromDB).to.have.property("comment_count");
    expect(await CommentFromDB.comment_count).to.equal(0);
  });

  it("Should fail to save a comment without a details", async function() {
    const comment = new Comment({});
    await expect(comment.save()).to.be.rejected;
  });

  it("Should fail to save a comment without a user", async function() {
    const comment = new Comment({ content: "Nice Post!" });
    await expect(comment.save()).to.be.rejected;
  });

  it("Should fail to save a comment without content", async function() {
    const comment = new Comment({ user: commenter });
    await expect(comment.save()).to.be.rejected;
  });

  it("Should allow a comment to have a comment", async function() {
    const subcomment = new Comment({
      user: subcommenter,
      content: "Nice Post to you too!"
    });
    const comment = new Comment({ user: commenter, content: "Nice Post!" });
    comment.comments.push(subcomment);
    await subcomment.save();
    await comment.save();

    const CommentFromDB = await Comment.findOne({
      user: commenter._id,
      content: "Nice Post!"
    });
    expect(CommentFromDB).to.exist;
    expect(CommentFromDB).to.have.property("_id");
    expect(CommentFromDB._id.toString()).to.equal(comment._id.toString());
    expect(CommentFromDB)
      .to.have.property("comments")
      .that.is.an.array();
    expect(CommentFromDB.comments).to.be.ofSize(1);
    expect(CommentFromDB.comments[0]._id.toString()).to.equal(
      subcomment._id.toString()
    );
    expect(CommentFromDB).to.have.property("comment_count");
    expect(await CommentFromDB.comment_count).to.equal(1);
  });
});
