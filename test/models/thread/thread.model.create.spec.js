const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Thread = require("../../../src/models/thread.model");
const User = require("../../../src/models/user.model");

describe("Thread Model Creation", function() {
  let user;

  beforeEach(done => {
    user = new User({ name: "ExistingUser", password: "ExistingPass" });
    user.save().then(() => done());
  });

  it("Should fail to save empty thread", async function() {
    const thread = new Thread({});
    await expect(thread.save()).to.be.rejected;
  });

  it("Should fail to save thread without a title", async function() {
    const properties = {
      content: "Some text here",
      user: user
    };

    const thread = new Thread(properties);
    await expect(thread.save()).to.be.rejected;
  });

  it("Should fail to save thread without content", async function() {
    const properties = {
      title: "a title here",
      user: user
    };

    const thread = new Thread(properties);
    await expect(thread.save()).to.be.rejected;
  });

  it("Should fail to save thread without a user", async function() {
    const properties = {
      title: "Some title here",
      content: "Some content here"
    };

    const thread = new Thread(properties);
    await expect(thread.save()).to.be.rejected;
  });

  it("Should succeed to save thread with title, content and user", async function() {
    const properties = {
      title: "Some title here",
      content: "Some content here",
      user: user
    };

    const thread = new Thread(properties);
    await thread.save();

    expect(thread).to.have.property("_id");
    expect(thread.isNew).to.be.false;

    const ThreadFromDb = await Thread.findOne({ _id: thread._id });
    expect(ThreadFromDb).to.have.property("comments");
    expect(ThreadFromDb).to.have.property("upvote_users");
    expect(ThreadFromDb).to.have.property("downvote_users");
    expect(ThreadFromDb)
      .to.have.property("upvotes")
      .that.equals(0);
    expect(ThreadFromDb)
      .to.have.property("downvotes")
      .that.equals(0);
  });
});
