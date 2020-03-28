const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);

mongoose.connect(
    process.env.DB_MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    err => {
        if (!err)
            console.log("MongoDB connected");
        else
            console.log("Error in Connecting to Database: " + err);
    }
);