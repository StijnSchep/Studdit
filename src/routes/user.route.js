const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");

/*
    Supported routes:
    POST /api/user '/' 
    PUT /api/user '/:name'
    DELETE /api/user '/:name'
*/

router.post("/", UserController.create);
router.put("/:name", UserController.update);
router.delete("/:name", UserController.delete);

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
