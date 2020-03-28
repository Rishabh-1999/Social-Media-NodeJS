var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

/* Models */
var User = require('../models/users');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// local strategy for login
passport.use('local.login', new localStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({
            email: email
        })
        .then(function (data) {
            if (bcrypt.compareSync(password, data.password)) {
                return done(null, data);
            } else {
                return done(null, false, req.flash('error', 'Credentials not matched.'));
            }
        }).catch(function (err) {
            console.error(err)
            return done(null, false, req.flash('error', 'Something went wrong.'));
        });
}));