const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Thread = require("../../../src/models/thread.model");
const User = require("../../../src/models/user.model");

describe("Thread Model deleting", function() {
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

  it("Should delete a thread", async function() {
    await Thread.deleteOne({ _id: thread._id });
    const ThreadFromDB = await Thread.findOne({ _id: thread._id });
    expect(ThreadFromDB).to.be.null;
  });

  // TODO: Add test to check if comments have been deleted as well
});
