const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");

describe("API - User creation", function() {
  beforeEach(done => {
    const user = new User({ name: "ExistingUser", password: "ExistingPass" });
    user.save().then(() => done());
  });

  it("Should send status 200 with user ID for current user", async function() {
    const user = {
      name: "NewUser",
      password: "NewPassword"
    };

    const res = await requester.post("/api/user").send(user);
    expect(res).to.have.status(200);
    expect(res).to.have.property("body");
    expect(res.body).to.have.property("_id");
    expect(res.body).to.have.property("name");
    expect(res.body).to.have.property("password");
  });

  it("Should send status 400 for duplicate User Name", async function() {
    const user = {
      name: "ExistingUser",
      password: "ExistingPass"
    };

    const res = await requester.post("/api/user").send(user);
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("user validation failed");
    expect(res.body).to.have.property("errors");
    expect(res.body.errors).to.have.property("name");
    expect(res.body.errors.name.kind).to.equal("unique");
  });

  it("should send status 400 for missing username", async function() {
    const user = {
      password: "ExistingPass"
    };

    const res = await requester.post("/api/user").send(user);

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("user validation failed");

    expect(res.body)
      .to.have.property("errors")
      .to.have.property("name")
      .to.have.property("message")
      .that.equals("Name is required");
  });

  it("should send status 400 for missing password", async function() {
    const user = {
      name: "ExistingPass"
    };

    const res = await requester.post("/api/user").send(user);

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("user validation failed");

    expect(res.body)
      .to.have.property("errors")
      .to.have.property("password")
      .to.have.property("message")
      .that.equals("Password is required");
  });
});
