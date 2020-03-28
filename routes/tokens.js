var express = require('express');
var router = express.Router();

/* Controllers */
var controllers = require("../controllers/index");

router.get('/activate/:user/:token', controllers.token.activate_user_token);

router.get('/reset/:user/:token', controllers.token.reset_user_token);

module.exports = router;