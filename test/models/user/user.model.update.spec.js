const assert = require("assert");

const User = require("../../../src/models/user.model");

describe("User Model Updating", function() {
  beforeEach(done => {
    const user = new User({ name: "ExistingUser", password: "ExistingPass" });
    user.save().then(() => done());
  });

  it("Should update the password", async function() {
    await User.findOneAndUpdate(
      { name: "ExistingUser", password: "ExistingPass" },
      { password: "NewPass" }
    );

    const updatedUser = await User.findOne({ name: "ExistingUser" });
    assert(updatedUser.password === "NewPass");
  });
});
