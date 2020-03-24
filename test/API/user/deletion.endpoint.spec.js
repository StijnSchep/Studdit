const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");

describe("API - User deleting", function() {
  beforeEach(done => {
    const user = new User({ name: "ExistingUser", password: "ExistingPass" });
    user.save().then(() => done());
  });

  it("Should send status 200 with message for correct password", async function() {
    const property = {
      password: "ExistingPass"
    };

    const res = await requester.delete("/api/user/ExistingUser").send(property);
    expect(res).to.have.status(200);
    expect(res).to.have.property("body");
    expect(res.body)
      .to.have.property("message")
      .that.equals("User has been deleted");

    const UserFromDb = await User.findOne({ name: "ExistingUser" });
    expect(UserFromDb).to.be.null;
  });

  it("Should send status 401 with message for incorrect password", async function() {
    const property = {
      password: "incorrect"
    };

    const res = await requester.delete("/api/user/ExistingUser").send(property);
    expect(res).to.have.status(401);
    expect(res).to.have.property("body");
    expect(res.body)
      .to.have.property("message")
      .that.equals("Password is invalid");

    // User should not be deleted
    const UserFromDb = await User.findOne({ name: "ExistingUser" });
    expect(UserFromDb)
      .to.have.property("password")
      .that.equals("ExistingPass");
  });

  it("should send status 204 when no username is specified", async function() {
    const update = {
      password: "ExistingPass",
      newPassword: "NewPass"
    };

    const res = await requester.delete("/api/user/").send(update);
    expect(res).to.have.status(204);

    // User should not be deleted
    const UserFromDb = await User.findOne({ name: "ExistingUser" });
    expect(UserFromDb)
      .to.have.property("password")
      .that.equals("ExistingPass");
  });

  // TODO: test if the user's Threads and comments have not been deleted
});
