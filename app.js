var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var engine = require("ejs-mate");
var flash = require("connect-flash");
var validator = require("express-validator");
var passport = require("passport");
var session = require("express-session");
var mongoose = require("mongoose");
var mongoStore = require("connect-mongo")(session);
var app = express();
var http = require("http");
var server = http.Server(app);
var PORT = process.env.PORT || 3000;
require("dotenv").config();
var cloundinary = require("cloudinary").v2;
var fileupload = require("express-fileupload");

app.use(
  fileupload({
    useTempFiles: true
  })
);

cloundinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECERT
});

require("./config/db");

var User = require("./models/users");

require("./config/passport");

var db = mongoose.connection;

app.use(morgan("dev"));

// view engine setup
app.engine("ejs", engine);
app.set("view engine", "ejs");

app.use(
  session({
    secret: "6sd65d6f45e95",
    resave: true,
    saveUninitialized: false,
    store: new mongoStore({
      mongooseConnection: db
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

/*
 * Express Validator - Error Formatter Middleware - START
 *(the formParam value is going to get morphed into form body format useful for printing.)
 */
app.use(
  validator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      isExist_email: function(email) {
        return new Promise(function(resolve, reject) {
          User.findOne(
            {
              email: email
            },
            (err, user) => {
              if (err) throw err;
              if (user) {
                return reject();
              }
              return resolve();
            }
          );
        });
      }
    }
  })
);

/*
 * Express Validator - Error Formatter Middleware - END
 */
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

app.use(function(req, res, next) {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  if (req.user) res.locals.session_id = req.user._id;
  next();
});

// route Path
var index = require("./routes/index");
var users = require("./routes/users");
var search = require("./routes/search");
var token = require("./routes/tokens");
var post = require("./routes/post");

app.use("/", index);
app.use("/", users);
app.use("/", search);
app.use("/", token);
app.use("/", post);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error", {
    title: "Page404",
    header: false
  });
});

server.listen(PORT, () => {
  console.log("Sever on port: " + PORT);
});
