// Requirements***************************************
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./model/user.js");

// Requirements config *******************************
const app = express();

var corsOptions = {
  origin:"http://localhost:3000/"
};

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://root:localhost:27017/Leaderboard?authSource=admin");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Db is connected");
});

// app.use *******************************************
app.use(cors(corsOptions));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.use(express.json);

app.use(express.urlencoded({extended:true}));

// Routes ***********************************************
app.get("/", (req,res) => {
  res.json({username:"username"})
});

require("./routes/methodRoutes.js")(app);
// Connection ****************************************
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Hello from port ${PORT}`)
})