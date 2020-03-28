var express = require('express');
var router = express.Router();
var passport = require('passport');

/* Middleware */
var middleware = require('../middlewares/middleware');

/* Controllers */
var controllers = require("../controllers/index");

/* GET login */
router.get('/', middleware.notAllowed, function (req, res, next) {
    res.render('index', {
        title: "Social Network | Login",
        header: false,
        navbar: false
    });
});

/* GET signup */
router.get('/signup', middleware.notAllowed, function (req, res, next) {
    res.render('signup', {
        title: "Social Network | Sign Up",
        header: false,
        navbar: false
    });
});

/* GET Logout */
router.get('/logout', function (req, res, next) {
    req.session.destroy();
    req.logout();
    res.redirect('/');
});

/* POST reset password */
router.post('/forgotpassword', middleware.checkSession, controllers.user.forgotpassword);

/* Post Login - Local */
router.post('/login', middleware.login_valid, passport.authenticate('local.login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}));

/* POST Register User */
router.post('/register', middleware.reg_valid, controllers.user.register);

/* POST Rest Password */
router.post('/reset/:user/:token', controllers.user.reset_user_token);

module.exports = router;