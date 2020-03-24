const express = require("express");
const router = express.Router();

const ThreadController = require("../controllers/thread.controller");

/*
    Supported routes:
    POST /api/thread '/'
    POST /api/thread '/:id/upvote'
    POST /api/thread '/:id/downvote'
    POST /api/thread '/:id/comment'

    GET /api/thread '/list'
    GET /api/thread '/:id'

    PUT /api/thread '/:id'
    
    DELETE /api/thread '/:id'
*/

router.post("/", ThreadController.create);
router.post("/:id/upvote", ThreadController.upvote);
router.post("/:id/downvote", ThreadController.downvote);
router.post("/:id/comment", ThreadController.addComment);

router.get("/list", ThreadController.list);
router.get("/:id", ThreadController.get);

router.put("/:id", ThreadController.update);

router.delete("/:id", ThreadController.delete);

const errorObject = {
  code: 204
};

router.put("/", function(req, res, next) {
  next(errorObject);
});
router.delete("/", function(req, res, next) {
  next(errorObject);
});

module.exports = router;
