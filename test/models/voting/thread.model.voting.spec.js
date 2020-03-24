const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Thread = require("../../../src/models/thread.model");
const User = require("../../../src/models/user.model");

describe("Thread Voting", function() {
  let creator;
  let voter;
  let thread;

  beforeEach(async function() {
    creator = new User({ name: "ThreadCreator", password: "CreatorPass" });
    voter = new User({ name: "Voter", password: "VoterPass" });
    await creator.save();
    await voter.save();

    const properties = {
      title: "Some title here",
      content: "Some content here",
      user: creator
    };
    thread = new Thread(properties);
    await thread.save();
  });

  it("Should let a user upvote a thread", async function() {
    const ThreadFromDB = await Thread.findOne({ _id: thread._id });
    ThreadFromDB.upvote_users.push(voter);
    await ThreadFromDB.save();

    expect(ThreadFromDB)
      .to.have.property("upvotes")
      .that.equals(1);
    expect(ThreadFromDB)
      .to.have.property("downvotes")
      .that.equals(0);

    const UpdatedThreadFromDB = await Thread.findOne({ _id: thread._id });
    expect(UpdatedThreadFromDB)
      .to.have.property("upvotes")
      .that.equals(1);
    expect(UpdatedThreadFromDB)
      .to.have.property("upvote_users")
      .that.contains(voter._id);
  });

  it("Should let a user downvote a thread", async function() {
    const ThreadFromDB = await Thread.findOne({ _id: thread._id });
    ThreadFromDB.downvote_users.push(voter);
    await ThreadFromDB.save();

    expect(ThreadFromDB)
      .to.have.property("upvotes")
      .that.equals(0);
    expect(ThreadFromDB)
      .to.have.property("downvotes")
      .that.equals(1);

    const UpdatedThreadFromDB = await Thread.findOne({ _id: thread._id });
    expect(UpdatedThreadFromDB)
      .to.have.property("downvotes")
      .that.equals(1);
    expect(UpdatedThreadFromDB)
      .to.have.property("downvote_users")
      .that.contains(voter._id);
  });

  it("Should let a user remove an upvote", async function() {
    const ThreadFromDB = await Thread.findOne({ _id: thread._id });
    ThreadFromDB.upvote_users.push(voter);
    await ThreadFromDB.save();

    await Thread.updateOne(
      { _id: thread._id },
      { $pull: { upvote_users: voter._id } }
    );
    const UpdatedThreadFromDB = await Thread.findOne({ _id: thread._id });
    expect(UpdatedThreadFromDB)
      .to.have.property("upvotes")
      .that.equals(0);
    expect(UpdatedThreadFromDB)
      .to.have.property("upvote_users")
      .that.does.not.contain(voter._id);
  });

  it("Should let a user remove a downvote", async function() {
    const ThreadFromDB = await Thread.findOne({ _id: thread._id });
    ThreadFromDB.downvote_users.push(voter);
    await ThreadFromDB.save();

    await Thread.updateOne(
      { _id: thread._id },
      { $pull: { downvote_users: voter._id } }
    );
    const UpdatedThreadFromDB = await Thread.findOne({ _id: thread._id });
    expect(UpdatedThreadFromDB)
      .to.have.property("downvotes")
      .that.equals(0);
    expect(UpdatedThreadFromDB)
      .to.have.property("downvote_users")
      .that.does.not.contain(voter._id);
  });
});
