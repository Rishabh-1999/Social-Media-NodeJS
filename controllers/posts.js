var cloundinary = require("cloudinary").v2;

/* Models */
var User = require('../models/users');
var Post = require('../models/post');

module.exports.post_id = async function (req, res, next) {
    Post.findOne({
            _id: req.params.id
        })
        .then(function (data) {
            res.render('post', {
                title: "Social Network",
                header: true,
                navbar: true,
                posts: [data],
                single: false
            });
        })
        .catch(function (err) {
            next(err);
        });
};

module.exports.savepost = async function (req, res, next) {
    var body = req.body.body;
    var file = req.files.upload;
    if (!file) {
        return res.send({
            msg: "Please upload image with post.",
            success: false
        });
    }
    var reqpath = "socialmedia/posts/" + Date.now() + "-" + (file.name);
    cloundinary.uploader.upload(
        file.tempFilePath, {
            public_id: reqpath,
            overwrite: true
        },
        function (err, data) {
            if (err) console.log(err);
            else {
                var userdata = {
                    userID: req.user._id,
                    fullname: req.user.fullname,
                    image: req.user.image
                };
                async.waterfall([
                    function (callback) {
                        var newPost = new Post();
                        newPost.body = body.trim();
                        newPost.image = data.url;
                        newPost.owner = userdata;
                        newPost.save((err, data) => {
                            if (err) res.send({
                                msg: "Something went wrong",
                                success: false
                            });
                            if (data) callback(null, data);
                        });
                    },
                    function (data, callback) {
                        User.findOneAndUpdate({
                                _id: req.user._id
                            }, {
                                $push: {
                                    posts: {
                                        post: data._id,
                                        body: data.body,
                                        image: data.image
                                    }
                                }
                            },
                            (err, user) => {
                                if (err) res.send({
                                    msg: "Something went wrong",
                                    success: false
                                });
                                if (user) res.send({
                                    msg: "Data Saved",
                                    post: data,
                                    success: true
                                });
                            }
                        );
                    }
                ]);
            }
        }
    );
};

module.exports.toggleLike = async function (req, res, next) {
    var postID = req.body.id;

    Post.findOne({
            _id: postID
        })
        .then(function (data) {
            var index = data.likes.indexOf(req.user._id);
            if (index == -1) {
                //find post owner and update likes
                User.findOne({
                        _id: data.owner.userID
                    })
                    .then(function (user) {
                        user.likes = user.likes + 1;
                        user.save((err, user) => {
                            if (err) res.send({
                                success: false
                            });
                            if (user) {
                                //update posts data
                                data.likes.push(req.user._id);
                                data.save((err, data) => {
                                    if (err) res.send({
                                        success: false
                                    })
                                    if (data) res.send({
                                        like: true,
                                        success: true
                                    });
                                });
                            }
                        });
                    })
                    .catch(function (err) {
                        next(err);
                    });
            } else {
                //find post owner and update likes
                User.findOne({
                        _id: data.owner.userID
                    })
                    .then(function (user) {
                        user.likes = user.likes - 1;
                        user.save((err, user) => {
                            if (err) res.send({
                                success: false
                            });
                            if (user) {
                                //update posts data
                                data.likes = data.likes.find(like => like != req.user._id);
                                data.save((err, data) => {
                                    if (err) res.send({
                                        success: false
                                    })
                                    if (data) res.send({
                                        like: false,
                                        success: true
                                    });
                                });
                            }
                        });
                    })
                    .catch(function (err) {
                        next(err);
                    });
            }
        })
        .catch(function (err) {
            next(err);
        });
};

module.exports.saveComment = async function (req, res, next) {
    if (!req.body.text) {
        return res.send({
            msg: "No comment",
            success: false
        });
    }
    Post.findOne({
            _id: req.body.id
        })
        .then(function (data) {
            data.comments.push({
                user: req.user._id,
                fullname: req.user.fullname,
                username: req.user.username,
                comment: req.body.text
            });
            data.save((err) => {
                if (err) res.send({
                    success: false
                });
                res.send({
                    success: true,
                    fullname: req.user.fullname,
                    _id: req.user._id
                });
            });
        })
        .catch(function (err) {
            next(err);
        })
};