const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const assert = require("assert");
const mongoose = require("mongoose");

const User = require("../../../src/models/user.model");

describe("User Model Creation", function() {
  beforeEach(done => {
    const user = new User({ name: "ExistingUser", password: "ExistingPass" });
    user.save().then(() => done());
  });

  it("Should fail to save empty user", async function() {
    const user = new User({});

    await expect(user.save()).to.be.rejected;
  });

  it("Should fail to save user with no username", async function() {
    const user = new User({
      name: null,
      password: "pass"
    });

    await expect(user.save()).to.be.rejected;
  });

  it("Should fail to save user with no password", async function() {
    const user = new User({
      name: "name",
      password: null
    });

    await expect(user.save()).to.be.rejected;
  });

  it("Should successfully save a user with username and password", async function() {
    const user = new User({
      name: "VeryNewUser",
      password: "VeryStrongPassword"
    });
    assert(user.isNew);

    await user.save();
    // na assessment
    expect(user).to.have.property("_id");
    assert(!user.isNew);

    const query = User.find({
      name: "VeryNewUser",
      password: "VeryStrongPassword"
    });
    assert(query instanceof mongoose.Query);

    const found = await query;
    assert(found.length === 1);
    assert(found[0]._id.toString() === user._id.toString());
  });

  it("Should fail to save a user with a duplicate username", async function() {
    // A user "ExistingUser" has been created in the beforeEach
    const secondUser = new User({ name: "ExistingUser", password: "dupPass" });
    await expect(secondUser.save()).to.be.rejected;
  });
});
