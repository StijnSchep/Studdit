const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Thread = require("../../../src/models/thread.model");
const Comment = require("../../../src/models/comment.model");
const User = require("../../../src/models/user.model");

describe("Thread Model Comments", function() {
  let user;
  let commenter;
  let subcommenter;
  let thread;

  beforeEach(async function() {
    user = new User({ name: "ExistingUser", password: "ExistingPass" });
    commenter = new User({ name: "Commenter", password: "Pass" });
    subcommenter = new User({ name: "SubCommenter", password: "Pass" });
    await user.save();
    await commenter.save();

    const properties = {
      title: "Original title",
      content: "Original content",
      user: user
    };
    thread = new Thread(properties);
    await thread.save();
  });

  it("Should add a comment to a thread", async function() {
    const comment = new Comment({ user: commenter, content: "Nice Post!" });
    await comment.save();
    thread.comments.push(comment);
    await thread.save();

    const ThreadFromDB = await Thread.findOne({ _id: thread._id });

    expect(ThreadFromDB)
      .to.have.property("comments")
      .that.is.an.array();
    expect(ThreadFromDB.comments).to.be.ofSize(1);

    expect(ThreadFromDB.comments[0])
      .to.have.property("content")
      .that.equals("Nice Post!");
  });

  it("Should show nested comments of a thread - 2nd level", async function() {
    const subcomment = new Comment({
      user: subcommenter,
      content: "Nice Post as well!"
    });
    const comment = new Comment({ user: commenter, content: "Nice Post!" });
    await subcomment.save();
    comment.comments.push(subcomment);
    await comment.save();

    thread.comments.push(comment);
    await thread.save();

    const ThreadFromDB = await Thread.findOne({ _id: thread._id });

    expect(ThreadFromDB.comments).to.be.ofSize(1);
    expect(ThreadFromDB.comments[0])
      .to.have.property("comments")
      .that.is.an.array();
    expect(ThreadFromDB.comments[0].comments).to.be.ofSize(1);
    expect(ThreadFromDB.comments[0].comments[0])
      .to.have.property("content")
      .that.equals("Nice Post as well!");
  });

  it("Should show 3rd level comments of a thread", async function() {
    const subsubcomment = new Comment({ user: commenter, content: "Thanks!" });
    const subcomment = new Comment({
      user: subcommenter,
      content: "Nice Post as well!"
    });
    const comment = new Comment({ user: commenter, content: "Nice Post!" });
    await subsubcomment.save();
    subcomment.comments.push(subsubcomment);
    await subcomment.save();
    comment.comments.push(subcomment);
    await comment.save();

    thread.comments.push(comment);
    await thread.save();

    const ThreadFromDB = await Thread.findOne({ _id: thread._id });

    expect(ThreadFromDB.comments).to.be.ofSize(1);
    expect(ThreadFromDB.comments[0].comments[0].comments[0])
      .to.have.property("content")
      .that.equals("Thanks!");
  });
});
