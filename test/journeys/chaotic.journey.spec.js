const chai = require("chai");
const expect = chai.expect;
const assertArrays = require("chai-arrays");
chai.use(assertArrays);

const requester = require("../../requester.spec");
const Comment = require("../../src/models/comment.model");

describe("Chaotic journey", function() {
  it("Should handle people adding and deleting comments", async function() {
    // Let Bob and Jack register
    const create_bob_res = await requester
      .post("/api/user")
      .send({ name: "Bob", password: "Pass" });
    const create_jack_res = await requester
      .post("/api/user")
      .send({ name: "Jack", password: "Pass" });
    expect(create_bob_res).to.have.status(200);
    expect(create_jack_res).to.have.status(200);

    // Let Jack create his apple thread
    const thread_properties = {
      title: "What are apples?",
      content: "Like seriously...",
      username: "Jack"
    };
    const create_thread_res = await requester
      .post("/api/thread")
      .send(thread_properties);
    expect(create_thread_res).to.have.status(200);

    // Let Bob reply to the thread
    const tId = create_thread_res.body._id.toString();
    const bob_comment_props = {
      username: "Bob",
      content: "Apples are strange indeed!"
    };
    const comment_res = await requester
      .post(`/api/thread/${tId}/comment`)
      .send(bob_comment_props);
    expect(comment_res).to.have.status(200);

    // Let Jack reply to Bob
    const cId = comment_res.body._id.toString();
    const jack_comment_props = { username: "Jack", content: "I know right!" };
    const subcomment_res = await requester
      .post(`/api/comment/${cId}/comment`)
      .send(jack_comment_props);
    expect(subcomment_res).to.have.status(200);

    // Let Bob reply back
    const cId2 = subcomment_res.body._id.toString();
    const bob_comment_props_2 = { username: "Bob", content: "Alright!" };
    const subsubcomment_res = await requester
      .post(`/api/comment/${cId2}/comment`)
      .send(bob_comment_props_2);
    expect(subsubcomment_res).to.have.status(200);

    // But now Bob deletes his comment...
    const delete_comment_res = await requester
      .delete(`/api/comment/${cId}`)
      .send({});
    expect(delete_comment_res).to.have.status(200);

    // Jack wants to check his thread
    const get_thread_res = await requester.get(`/api/thread/${tId}`);
    expect(get_thread_res).to.have.status(200);
    expect(get_thread_res.body)
      .to.have.property("comment_count")
      .that.equals(0);
    expect(get_thread_res.body)
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(0);

    // Subcomment should have been deleted
    let comment = await Comment.findOne({
      _id: subcomment_res.body._id.toString()
    });
    expect(comment).to.be.null;

    // Subsubcomment should have been deleted
    comment = await Comment.findOne({
      _id: subsubcomment_res.body._id.toString()
    });
    expect(comment).to.be.null;
  });

  it("Should handle people deleting threads", async function() {
    // Let Bob and Jack register
    const create_bob_res = await requester
      .post("/api/user")
      .send({ name: "Bob", password: "Pass" });
    const create_jack_res = await requester
      .post("/api/user")
      .send({ name: "Jack", password: "Pass" });
    expect(create_bob_res).to.have.status(200);
    expect(create_jack_res).to.have.status(200);

    // Let Jack create his apple thread
    const thread_properties = {
      title: "What are apples?",
      content: "Like seriously...",
      username: "Jack"
    };
    const create_thread_res = await requester
      .post("/api/thread")
      .send(thread_properties);
    expect(create_thread_res).to.have.status(200);

    // Let Bob reply to the thread
    const tId = create_thread_res.body._id.toString();
    const bob_comment_props = {
      username: "Bob",
      content: "Apples are strange indeed!"
    };
    const comment_res = await requester
      .post(`/api/thread/${tId}/comment`)
      .send(bob_comment_props);
    expect(comment_res).to.have.status(200);

    // Let Jack reply to Bob
    const cId = comment_res.body._id.toString();
    const jack_comment_props = { username: "Jack", content: "I know right!" };
    const subcomment_res = await requester
      .post(`/api/comment/${cId}/comment`)
      .send(jack_comment_props);
    expect(subcomment_res).to.have.status(200);

    // Let Bob reply back
    const cId2 = subcomment_res.body._id.toString();
    const bob_comment_props_2 = { username: "Bob", content: "Alright!" };
    const subsubcomment_res = await requester
      .post(`/api/comment/${cId2}/comment`)
      .send(bob_comment_props_2);
    expect(subsubcomment_res).to.have.status(200);

    // But now Jack removes the thread...
    const remove_thread_res = await requester
      .delete(`/api/thread/${tId}`)
      .send({});
    expect(remove_thread_res).to.have.status(200);

    // Checking out the thread should return 404
    const get_thread_res = await requester.get(`/api/thread/${tId}`).send({});
    expect(get_thread_res).to.have.status(404);

    // Comment should have been deleted
    let comment = await Comment.findOne({
      _id: comment_res.body._id.toString()
    });
    expect(comment).to.be.null;

    // Subcomment should have been deleted
    comment = await Comment.findOne({
      _id: subcomment_res.body._id.toString()
    });
    expect(comment).to.be.null;

    // Subsubcomment should have been deleted
    comment = await Comment.findOne({
      _id: subsubcomment_res.body._id.toString()
    });
    expect(comment).to.be.null;
  });

  it("Should handle users deleting their account", async function() {
    // Let Bob and Jack register
    const create_bob_res = await requester
      .post("/api/user")
      .send({ name: "Bob", password: "Pass" });
    const create_jack_res = await requester
      .post("/api/user")
      .send({ name: "Jack", password: "Pass" });
    expect(create_bob_res).to.have.status(200);
    expect(create_jack_res).to.have.status(200);

    // Let Jack create his apple thread
    const thread_properties = {
      title: "What are apples?",
      content: "Like seriously...",
      username: "Jack"
    };
    const create_thread_res = await requester
      .post("/api/thread")
      .send(thread_properties);
    expect(create_thread_res).to.have.status(200);

    // Let Bob reply to the thread
    const tId = create_thread_res.body._id.toString();
    const bob_comment_props = {
      username: "Bob",
      content: "Apples are strange indeed!"
    };
    const comment_res = await requester
      .post(`/api/thread/${tId}/comment`)
      .send(bob_comment_props);
    expect(comment_res).to.have.status(200);

    // Let Jack reply to Bob
    const cId = comment_res.body._id.toString();
    const jack_comment_props = { username: "Jack", content: "I know right!" };
    const subcomment_res = await requester
      .post(`/api/comment/${cId}/comment`)
      .send(jack_comment_props);
    expect(subcomment_res).to.have.status(200);

    // Let Bob reply back
    const cId2 = subcomment_res.body._id.toString();
    const bob_comment_props_2 = { username: "Bob", content: "Alright!" };
    const subsubcomment_res = await requester
      .post(`/api/comment/${cId2}/comment`)
      .send(bob_comment_props_2);
    expect(subsubcomment_res).to.have.status(200);

    // But now Jack removes his account...
    const delete_jack_res = await requester
      .delete(`/api/user/Jack`)
      .send({ password: "Pass" });
    expect(delete_jack_res).to.have.status(200);

    // The thread should still exist
    const get_thread_res = await requester.get(`/api/thread/${tId}`).send({});
    expect(get_thread_res).to.have.status(200);
    expect(get_thread_res.body.comment_count).to.equal(3);
  });
});
