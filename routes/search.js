var express = require('express');
var router = express.Router();

/* Middleware */
var middleware = require('../middlewares/middleware');

/* Controllers */
var controllers = require("../controllers/index")

router.get('/search', middleware.isAllowed, function (req, res, next) {
	res.render('search', {
		title: 'Social Network | Search',
		header: false,
		navbar: true
	});
});

router.get('/findUser', controllers.search.findUser);

module.exports = router;