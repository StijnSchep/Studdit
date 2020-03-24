const express = require("express");
const router = express.Router();

const CommentController = require("../controllers/comment.controller");

/*
    Supported routes:
    POST /api/comment '/:id/comment'  <- add comment to comment with given id
    POST /api/comment '/:id/upvote'
    POST /api/comment '/:id/downvote'
    DELETE /api/comment '/:id'
*/

router.post("/:id/comment", CommentController.addComment);
router.post("/:id/upvote", CommentController.upvote);
router.post("/:id/downvote", CommentController.downvote);
router.delete("/:id", CommentController.delete);

module.exports = router;
