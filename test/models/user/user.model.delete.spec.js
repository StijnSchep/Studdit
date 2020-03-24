const assert = require("assert");

const User = require("../../../src/models/user.model");

describe("User Model Deleting", function() {
  beforeEach(done => {
    const user = new User({ name: "ExistingUser", password: "ExistingPass" });
    user.save().then(() => done());
  });

  it("Should update the password", async function() {
    await User.deleteOne({ name: "ExistingUser", password: "ExistingPass" });

    const deletedUser = await User.findOne({ name: "ExistingUser" });
    assert(!deletedUser);
  });
});
