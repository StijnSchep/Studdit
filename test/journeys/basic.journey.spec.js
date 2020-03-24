const chai = require("chai");
const expect = chai.expect;
const assertArrays = require("chai-arrays");
chai.use(assertArrays);

const requester = require("../../requester.spec");

describe("Basic journey", function() {
  it("Should let two users have a thread, vote, comment interaction", async function() {
    /*
            Users Bob and Jack register
            Jack creates a thread
            Bob leaves an upvote and a comment
            Jack replies to comment
        */

    // Let bob and jack register
    const create_bob_res = await requester
      .post("/api/user")
      .send({ name: "Bob", password: "Pass" });
    const create_jack_res = await requester
      .post("/api/user")
      .send({ name: "Jack", password: "Pass" });
    expect(create_bob_res).to.have.status(200);
    expect(create_jack_res).to.have.status(200);

    // Bob and Jack are friends
    const friendship_res = await requester
      .post("/api/friendship/")
      .send({ user_one: "Bob", user_two: "Jack" });
    expect(friendship_res).to.have.status(200);

    // Bob wants to change his password to something stronger
    const update_bob_res = await requester
      .put("/api/user/Bob")
      .send({ password: "Pass", newPassword: "Strong" });
    expect(update_bob_res).to.have.status(200);

    // Jack wants to create a thread about apples
    const thread_properties = {
      title: "What are apples?",
      content: "Like seriously...",
      username: "Jack"
    };
    const create_thread_res = await requester
      .post("/api/thread")
      .send(thread_properties);
    expect(create_thread_res).to.have.status(200);

    // Bob likes the thread, leaves an upvote
    const tId = create_thread_res.body._id.toString();
    const upvote_res = await requester
      .post(`/api/thread/${tId}/upvote`)
      .send({ username: "Bob" });
    expect(upvote_res).to.have.status(200);

    // Bob wants to leave a comment
    const bob_comment_props = {
      username: "Bob",
      content: "Apples are strange indeed!"
    };
    const comment_res = await requester
      .post(`/api/thread/${tId}/comment`)
      .send(bob_comment_props);
    expect(comment_res).to.have.status(200);

    // Jack replies to bob
    const cId = comment_res.body._id.toString();
    const jack_comment_props = { username: "Jack", content: "I know right!" };
    const subcomment_res = await requester
      .post(`/api/comment/${cId}/comment`)
      .send(jack_comment_props);
    expect(subcomment_res).to.have.status(200);

    // Jack wants to inspect his friendly apple thread
    const get_thread_res = await requester.get(`/api/thread/${tId}`);
    expect(get_thread_res).to.have.status(200);
    expect(get_thread_res.body)
      .to.have.property("comment_count")
      .that.equals(2);
    expect(get_thread_res.body)
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(1);
  });

  it("should let people compare their vote count", async function() {
    // Let 4 people register: Bob, Jack, Voter1, Voter2
    const create_bob_res = await requester
      .post("/api/user")
      .send({ name: "Bob", password: "Pass" });
    const create_jack_res = await requester
      .post("/api/user")
      .send({ name: "Jack", password: "Pass" });
    const create_voter1_res = await requester
      .post("/api/user")
      .send({ name: "Voter1", password: "Pass" });
    const create_voter2_res = await requester
      .post("/api/user")
      .send({ name: "Voter2", password: "Pass" });
    expect(create_bob_res).to.have.status(200);
    expect(create_jack_res).to.have.status(200);
    expect(create_voter1_res).to.have.status(200);
    expect(create_voter2_res).to.have.status(200);

    // Let Jack create a thread about apples
    let thread_properties = {
      title: "What are apples?",
      content: "Like seriously...",
      username: "Jack"
    };
    const jack_thread_res = await requester
      .post("/api/thread")
      .send(thread_properties);
    expect(jack_thread_res).to.have.status(200);

    // Let Bob create a thread about bananas
    thread_properties = {
      title: "Bananas are awesome?",
      content: "Like seriously...",
      username: "Bob"
    };
    const bob_thread_res = await requester
      .post("/api/thread")
      .send(thread_properties);
    expect(bob_thread_res).to.have.status(200);

    // Let voter1 and voter2 upvote Bob's thread, they like bananas
    const tId = bob_thread_res.body._id.toString();
    const upvote_res_1 = await requester
      .post(`/api/thread/${tId}/upvote`)
      .send({ username: "Voter1" });
    const upvote_res_2 = await requester
      .post(`/api/thread/${tId}/upvote`)
      .send({ username: "Voter2" });
    expect(upvote_res_1).to.have.status(200);
    expect(upvote_res_2).to.have.status(200);

    // Let the people request the list of threads, sorted by upvotes
    const get_list_res = await requester
      .get("/api/thread/list?sortBy=upvotes")
      .send({});
    expect(get_list_res).to.have.status(200);
    expect(get_list_res.body)
      .to.be.an.array()
      .ofSize(2);
    expect(get_list_res.body[0]).to.not.have.property("comments");
    expect(get_list_res.body[0]._id.toString()).to.equal(tId);
    expect(get_list_res.body[0])
      .to.have.property("upvotes")
      .that.equals(2);
  });

  it("should let people vote on subcomments", async function() {
    // Let 4 people register: Bob, Jack, Voter1, Voter2
    const create_bob_res = await requester
      .post("/api/user")
      .send({ name: "Bob", password: "Pass" });
    const create_jack_res = await requester
      .post("/api/user")
      .send({ name: "Jack", password: "Pass" });
    const create_voter1_res = await requester
      .post("/api/user")
      .send({ name: "Voter1", password: "Pass" });
    const create_voter2_res = await requester
      .post("/api/user")
      .send({ name: "Voter2", password: "Pass" });
    expect(create_bob_res).to.have.status(200);
    expect(create_jack_res).to.have.status(200);
    expect(create_voter1_res).to.have.status(200);
    expect(create_voter2_res).to.have.status(200);

    // Let Jack create a thread about apples
    let thread_properties = {
      title: "What are apples?",
      content: "Like seriously...",
      username: "Jack"
    };
    const jack_thread_res = await requester
      .post("/api/thread")
      .send(thread_properties);
    expect(jack_thread_res).to.have.status(200);

    // Bob wants to leave a comment
    const bob_comment_props = {
      username: "Bob",
      content: "Apples are strange indeed!"
    };
    const tId = jack_thread_res.body._id.toString();
    const comment_res = await requester
      .post(`/api/thread/${tId}/comment`)
      .send(bob_comment_props);
    expect(comment_res).to.have.status(200);

    // Voter1 likes the comment, Voter2 dislikes the comment
    const cId = comment_res.body._id.toString();
    const voter1_vote_res = await requester
      .post(`/api/comment/${cId}/upvote`)
      .send({ username: "Voter1" });
    const voter2_vote_res = await requester
      .post(`/api/comment/${cId}/downvote`)
      .send({ username: "Voter2" });

    expect(voter1_vote_res).to.have.status(200);
    expect(voter2_vote_res).to.have.status(200);

    // Jack wants to inspect his friendly apple thread
    const get_thread_res = await requester.get(`/api/thread/${tId}`);
    expect(get_thread_res).to.have.status(200);
    expect(get_thread_res.body)
      .to.have.property("comment_count")
      .that.equals(1);
    expect(get_thread_res.body)
      .to.have.property("comments")
      .that.is.an.array()
      .ofSize(1);
    expect(get_thread_res.body.comments[0])
      .to.have.property("upvote_users")
      .that.is.an.array()
      .ofSize(1);
    expect(get_thread_res.body.comments[0])
      .to.have.property("downvote_users")
      .that.is.an.array()
      .ofSize(1);
  });
});
