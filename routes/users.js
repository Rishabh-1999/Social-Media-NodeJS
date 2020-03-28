var express = require('express');
var router = express.Router();

/* Middleware */
var middleware = require('../middlewares/middleware');

/* Controllers */
var controllers = require("../controllers/index");

/* Models */
var User = require('../models/users');

/* GET users homepage. */
router.get('/home', middleware.isAllowed, controllers.user.home);

/* GET user profilepage. */
router.get('/profile/:id', middleware.isAllowed, controllers.user.profile_id);

/* GET user update. */
router.get('/update', middleware.isAllowed, controllers.user.get_update);

/* POST update photo */
router.post('/upload', function (req, res, next) {
	if (req.files) {
		var reqpath = "socialmedia/profile/" + Date.now() + "-" + (file.name);
		cloundinary.uploader.upload(
			file.tempFilePath, {
				public_id: reqpath,
				overwrite: true
			},
			function (err, data) {
				if (err) console.log(err);
				else {
					User.findOneAndUpdate({
						_id: req.user._id
					}, {
						$set: {
							image: req.file.filename
						}
					}, (err, user) => {
						if (err) res.send({
							msg: "Something went wrong",
							success: false
						});
						if (user) {
							req.user.image = req.file.filename;
							req.session.save();
							res.send({
								msg: "Photo Updated",
								success: true,
								image: req.file.filename
							});
						};
					});
				}
			})
	} else {
		res.send({
			msg: "Oops! Upload photo",
			success: false
		});
	}
});

/* POST user update */
router.post('/update', middleware.update_Valid, controllers.user.post_update);

/* POST change password */
router.post('/change_password/:id', middleware.change_valid, controllers.user.change_password_id);

/* GET Follow  */
router.post('/follow', controllers.user.follow);

/* Unfollow */
router.post('/unfollow', controllers.user.unfollow);

module.exports = router;