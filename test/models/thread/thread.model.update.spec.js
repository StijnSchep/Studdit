const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Thread = require("../../../src/models/thread.model");
const User = require("../../../src/models/user.model");

describe("Thread Model updating", function() {
  let user;
  let thread;
  beforeEach(async function() {
    user = new User({ name: "ExistingUser", password: "ExistingPass" });
    await user.save();

    const properties = {
      title: "Original title",
      content: "Original content",
      user: user
    };
    thread = new Thread(properties);
    await thread.save();
  });

  it("Should update a thread", async function() {
    await Thread.updateOne(
      { _id: thread._id },
      { $set: { content: "New content" } }
    );
    const ThreadFromDB = await Thread.findOne({ _id: thread._id });

    expect(ThreadFromDB)
      .to.have.property("content")
      .that.equals("New content");
  });
});
