var express = require('express');
var router = express.Router();

/* Controllers */
var controllers = require("../controllers/index")

/* GET post */
router.get('/post/:id', controllers.posts.post_id);

/* POST save */
router.post('/savepost', controllers.posts.savepost);

// Like Toggle
router.post('/toggleLike', controllers.posts.toggleLike);

/* Save Comment */
router.post('/saveComment', controllers.posts.saveComment);

module.exports = router;