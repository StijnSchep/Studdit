const express = require("express");
const router = express.Router();

const FriendshipController = require("../controllers/friendship.controller");

/*
    Supported routes:
    POST /api/friendship '/:first/:second'
    DELETE /api/friendship '/:first/:second'
*/

router.post("/", FriendshipController.add);
router.delete("/:first/:second", FriendshipController.remove);

module.exports = router;
