const chai = require("chai");
const expect = chai.expect;

const requester = require("../../../requester.spec");

const User = require("../../../src/models/user.model");
const Comment = require("../../../src/models/comment.model");

describe("API - Comment voting", function() {
  let creator;
  let upvoter;
  let downvoter;
  let voter;
  let comment;

  beforeEach(async function() {
    creator = new User({ name: "ExistingUser", password: "ExistingPass" });
    voter = new User({ name: "Voter", password: "VoterPass" });
    upvoter = new User({ name: "Upvoter", password: "VoterPass" });
    downvoter = new User({ name: "Downvoter", password: "VoterPass" });
    await creator.save();
    await upvoter.save();
    await downvoter.save();
    await voter.save();

    const properties = {
      content: "Some content here",
      user: creator
    };

    comment = new Comment(properties);
    comment.upvote_users.push(upvoter);
    comment.downvote_users.push(downvoter);
    await comment.save();
  });

  it("Should let user upvote, return status 200 with updated comment", async function() {
    const body = {
      username: voter.name
    };

    const res = await requester
      .post(`/api/comment/${comment._id}/upvote`)
      .send(body);
    expect(res).to.have.status(200);
    expect(res.body);
    expect(res.body)
      .to.have.property("_id")
      .that.equals(comment._id.toString());
    expect(res.body)
      .to.have.property("upvotes")
      .that.equals(2);
    expect(res.body)
      .to.have.property("downvotes")
      .that.equals(1);
  });

  it("Should not update upvote count if user already upvoted", async function() {
    const body = {
      username: upvoter.name
    };

    const res = await requester
      .post(`/api/comment/${comment._id}/upvote`)
      .send(body);
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("_id")
      .that.equals(comment._id.toString());
    expect(res.body)
      .to.have.property("upvotes")
      .that.equals(1);
    expect(res.body)
      .to.have.property("downvotes")
      .that.equals(1);
  });

  it("Should let user downvote, return status 200 with updated comment", async function() {
    const body = {
      username: voter.name
    };

    const res = await requester
      .post(`/api/comment/${comment._id}/downvote`)
      .send(body);
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("_id")
      .that.equals(comment._id.toString());
    expect(res.body)
      .to.have.property("upvotes")
      .that.equals(1);
    expect(res.body)
      .to.have.property("downvotes")
      .that.equals(2);
  });

  it("Should not update downvote count if user already downvoted", async function() {
    const body = {
      username: downvoter.name
    };

    const res = await requester
      .post(`/api/comment/${comment._id}/downvote`)
      .send(body);
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("_id")
      .that.equals(comment._id.toString());
    expect(res.body)
      .to.have.property("upvotes")
      .that.equals(1);
    expect(res.body)
      .to.have.property("downvotes")
      .that.equals(1);
  });

  it("should remove a users upvote when downvoting", async function() {
    const body = {
      username: upvoter.name
    };

    const res = await requester
      .post(`/api/comment/${comment._id}/downvote`)
      .send(body);
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("_id")
      .that.equals(comment._id.toString());
    expect(res.body)
      .to.have.property("upvotes")
      .that.equals(0);
    expect(res.body)
      .to.have.property("downvotes")
      .that.equals(2);
  });

  it("should remove a users downvote when upvoting", async function() {
    const body = {
      username: downvoter.name
    };

    const res = await requester
      .post(`/api/comment/${comment._id}/upvote`)
      .send(body);
    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("_id")
      .that.equals(comment._id.toString());
    expect(res.body)
      .to.have.property("upvotes")
      .that.equals(2);
    expect(res.body)
      .to.have.property("downvotes")
      .that.equals(0);
  });

  it("Should return status 204 if comment does not exist when upvoting", async function() {
    const res = await requester.post(`/api/comment/unknown/upvote`);

    expect(res).to.have.status(204);
  });

  it("Should return status 204 if user does not exist when upvoting", async function() {
    const res = await requester.post(`/api/comment/${comment._id}/upvote`);

    expect(res).to.have.status(204);
  });

  it("Should return status 204 if comment does not exist when downvoting", async function() {
    const res = await requester.post(`/api/comment/unknown/downvote`);

    expect(res).to.have.status(204);
  });

  it("Should return status 204 if user does not exist when downvoting", async function() {
    const res = await requester.post(`/api/comment/${comment._id}/downvote`);

    expect(res).to.have.status(204);
  });
});
