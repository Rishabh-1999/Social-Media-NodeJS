var bcrypt = require('bcrypt');

/*  Models */
var User = require("../models/users");
var Post = require('../models/post');

/* Methods */
var methods = require('../config/methods');

module.exports.forgotpassword = async function (req, res, next) {
    var data;
    if (req.body.email == "") {
        data = {
            msg: "Email address required.",
            param: "",
            success: false
        };
        res.send(data);
    } else {
        req.checkBody('email', 'Email already exist').isExist_email();
        req.getValidationResult()
            .then(function (result) {
                var error = result.array();
                var data;
                if (error.length == 0) {
                    data = {
                        msg: "Email address not found.",
                        success: false
                    };
                    res.send(data);
                } else {
                    var hash = methods.token(req.body.email);
                    var mailOptions = {
                        from: 'Social Network',
                        to: req.body.email,
                        subject: 'PASSWORD RESET',
                        html: `<h1>RESET PASSWORD</h1>
                                <p>Your request for password reset is approved.Click <a href="${process.env.URL}reset/${req.body.email}/${hash}">here</a> to activate.Valid for 30 minutes only.</p>          `
                    };

                    methods.sendMail(mailOptions).then(function (info) {
                        User.findOneAndUpdate({
                                email: req.body.email
                            }, {
                                $set: {
                                    resetToken: hash,
                                    expireToken: Date.now() + 60 * 30 * 1000
                                }
                            },
                            (err, user) => {
                                if (err) data = {
                                    msg: "Something went wrong.",
                                    success: false
                                };
                                if (user) data = {
                                    msg: "Check your email for the reset link.",
                                    success: true
                                };
                                res.send(data);
                            });
                    }).catch(function (err) {
                        var data = {
                            msg: "Something went wrong.",
                            param: "",
                            success: false
                        };
                        res.send(data);
                    });
                }
            });
    }
}

module.exports.register = async function (req, res, next) {
    var hash = methods.token(req.body.email);
    var userData = {
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        accountToken: hash
    };

    /**  
     *  Sending activation tokento user for account activation. - START
     **/
    var mailOptions = {
        from: 'Social Network',
        to: userData.email,
        subject: 'Account Acivation',
        html: `<h1>Account Activation</h1>
                <p>Hello <b>${userData.fullname}</b>.<br>Your account has been successfully created and to make 
                a use of it you have to activate your account by clicking <a href="${process.env.URL}activate/${userData.username}/${userData.accountToken}">here</a>.</p>
                        `
    };

    methods.sendMail(mailOptions).then(function (info) {
        var newUser = new User(userData);
        newUser.save((err) => {
            if (err) throw err;
            var data = {
                msg: "Account created successfully.Check your email for activation.",
                success: true
            };
            res.send(data);
        });
    }).catch(function (err) {
        console.log(err)
        var data = {
            msg: "Something went wrong.",
            param: "",
            success: false
        };
        res.send(data);
    });
}

module.exports.reset_user_token = async function (req, res, next) {
    req.checkBody('newPassword', 'All fields are mandatory.').notEmpty();
    req.checkBody('confirmPassword', 'All fields are mandatory.').notEmpty();
    req.checkBody('newPassword', 'Password must be greater than 7 characters.').len(8);
    req.assert('confirmPassword', 'Password not matched').equals(req.body.newPassword);

    req.getValidationResult().then(function (result) {
        var error = result.array();
        if (error.length > 0) {
            req.flash('error', error[0].msg);
            res.redirect('/reset/' + req.params.user + '/' + req.params.token);
        } else {
            User.findOneAndUpdate({
                    $and: [{
                        email: req.params.user
                    }, {
                        resetToken: req.params.token
                    }]
                }, {
                    $set: {
                        expireToken: Date.now(),
                        resetToken: "",
                        password: bcrypt.hashSync(req.body.newPassword, 10)
                    }
                },
                (err, user) => {
                    if (err) throw err;
                    if (!user) req.flash('error', 'Something went wrong.');
                    if (user) req.flash('success', 'Password reset successfully.');
                    res.redirect('/');
                });
        }
    });
}

module.exports.home = async function (req, res, next) {
    Post.find((err, post) => {
        if (err) next(err);
        res.render('home', {
            title: "Social Network",
            header: true,
            navbar: true,
            user: req.user,
            isImage: req.user.image.includes("http"),
            posts: post,
            single: true
        });
    }).sort({
        'date': -1
    });
}

module.exports.profile_id = async function (req, res, next) {
    User.findOne({
            _id: req.params.id
        })
        .then(function (data) {
            res.render('profile', {
                title: "Social Network",
                header: true,
                navbar: true,
                user: data,
                allow: (req.user._id == data._id),
                isFollow: data.followers.find(user => user == req.user._id)
            });
        }).catch(function (err) {
            next(err);
        });
}

module.exports.get_update = async function (req, res, next) {
    User.findOne({
            _id: req.user._id
        })
        .then(function (data) {
            res.render('settings', {
                title: "Social Network",
                header: true,
                navbar: true,
                user: data,
                isImage: req.user.image.includes("http")
            });
        }).catch(function (err) {
            next(err);
        });
}

module.exports.post_update = async function (req, res, next) {
    User.findOneAndUpdate({
        _id: req.user._id
    }, {
        $set: {
            fullname: req.body.fullname,
            username: req.body.username,
            bio: req.body.bio
        }
    }, (err, user) => {
        if (err) res.send({
            msg: "Something went wrong",
            success: false
        });
        if (user) {
            req.user.fullname = req.body.fullname;
            req.user.username = req.body.username;
            req.user.bio = req.body.bio;
            req.session.save();
            res.send({
                msg: "Information Updated",
                success: true
            });
        }
    });
}

module.exports.change_password_id = async function (req, res, next) {
    var hash = bcrypt.hashSync(req.body.newPassword, 10);
    User.findOneAndUpdate({
        _id: req.params.id
    }, {
        $set: {
            password: hash
        }
    }, (err, user) => {
        if (err) res.send({
            msg: "Something went wrong",
            success: false
        });
        if (user) {
            req.user.password = hash;
            req.session.save();
            res.send({
                msg: "Password changed",
                success: true
            });
        }
    });
}

module.exports.follow = async function (req, res, next) {
    var to = req.body.id;
    var from = req.user._id;

    async.parallel([
        function (callback) {
            User.findOneAndUpdate({
                    _id: to
                }, {
                    $push: {
                        followers: from
                    }
                },
                (err, user) => {
                    if (user) callback(null, user);
                    if (err) callback(null, err);
                }
            )

        },
        function (callback) {
            User.findOneAndUpdate({
                    _id: from
                }, {
                    $push: {
                        following: to
                    }
                },
                (err, user) => {
                    if (user) callback(null, user);
                    if (err) callback(null, err);
                }
            )

        }
    ], function (err, results) {
        if (err) res.send({
            msg: 'Denied',
            success: false
        });
        if (results) {
            req.user.following.push(to);
            req.session.save();
            return res.send({
                msg: 'Follow',
                success: true
            });
        }
    });
}

module.exports.unfollow = async function (req, res, next) {
    var to = req.body.id;
    var from = req.user._id;

    async.parallel([
        function (callback) {
            User.findOneAndUpdate({
                    _id: to
                }, {
                    $pull: {
                        followers: from
                    }
                },
                (err, user) => {
                    if (user) callback(null, user);
                    if (err) callback(null, err);
                }
            )
        },
        function (callback) {
            User.findOneAndUpdate({
                    _id: from
                }, {
                    $pull: {
                        following: to
                    }
                },
                (err, user) => {
                    if (user) callback(null, user);
                    if (err) callback(null, err);
                }
            )
        }
    ], function (err, results) {
        if (err) res.send({
            msg: 'Denied',
            success: false
        });
        if (results) {
            req.user.following = req.user.following.filter(following => following !== to);
            req.session.save();
            return res.send({
                msg: 'Unfollow',
                success: true
            });
        }
    });
}