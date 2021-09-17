// Requirements
const mongoose = require("mongoose");
mongoose.connect("mongodb://root:159753mel@localhost:27017/Leaderboard?authSource=admin");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Db is connected")
});

const User = require("../model/user.js");
const countries = require("./countries.js");
const adj = require("./adjectives.js");
const name = require("./name.js");

// body
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await User.deleteMany({});
  for (var i = 0; i < 10000; i++) {
    const random1000 = Math.floor(Math.random()*1000);
    const random261 = Math.floor(Math.random()*261);
    const random243 = Math.floor(Math.random()*243);
    const user = new User ({
      username: `${adj[random261]}_${name[random1000].first_name}`,
      country: `${countries[random243].code} `,
      money: `${random1000}`
    });
    await user.save();
  }    
}

seedDB().then(() => {
  db.close()
})
