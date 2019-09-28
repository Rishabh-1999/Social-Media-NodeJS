var express = require('express');
var path = require('path');
var app = express()
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var engine = require('ejs-mate');
var session = require('express-session'); 
var mongoose = require('mongoose');
var passport = require('passport');
var mongoStore = require('connect-mongo')(session);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));

//Bodyparser
app.use(express.urlencoded({extended: true})); 
app.use(express.json()); 

var mongoDB = 'mongodb://localhost/myDB';

var db=mongoose.connection.on('error', (err) => {
    console.log('DB connection Error');
});

mongoose.connection.on('connected', (err) => {
    console.log('DB connected');
});

mongoose.connect(mongoDB,{ useNewUrlParser: true });

app.use(session({
    secret: "abcUCAChitkara",
    resave: true,
    saveUninitialized: true,
    store : new mongoStore({mongooseConnection:db})
  }));


app.use(passport.initialize());
app.use(passport.session());

console.log("Running on port 3000");
app.listen(3000)

module.exports = app;