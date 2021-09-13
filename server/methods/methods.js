// Requirements ******************************************************
const User = require("../model/user.js");
const redis = require("redis");
const { promisify } = require("util");


// redis && error check
const client = redis.createClient();
client.on("error", function(error) {
  console.error(error);
});

// AsyncRedis commands ************************************************

const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);
const zaddAsync = promisify(client.zadd).bind(client);
const hmsetAsync = promisify(client.hmset).bind(client);
const hsetAsync = promisify(client.hset).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const zrevrangeAsync = promisify(client.zrevrange).bind(client);
const zrevrankAsync = promisify(client.zrevrank).bind(client);
const zscoreAsync = promisify(client.zscore).bind(client);
const zcountAsync = promisify(client.zcount).bind(client);

// functions and varibles **********************************************

const findUser = async (n) => {
  let user = await zrevrangeAsync("zset",n ,n);
  return await user[0]
}

const listLeaderboard = async(myId) => {
  let pricePool = await prizePool();
  let totalPlayer = await zcountAsync("zset", 0, Infinity);
  let first100Obj = [];
  let first100 = await  zrevrangeAsync("zset", 0, 99);
  let me = await zrevrankAsync("zset", myId);


  for (var i = 0; i < 100; i++) {
    let arrayOfObj = {};
    let yesterdayRank = await hgetAsync(first100[i], "yesterdayRank");
    arrayOfObj.id = first100[i];
    arrayOfObj.username = await hgetAsync(first100[i], "username");
    arrayOfObj.country = await hgetAsync(first100[i], "country");
    arrayOfObj.money = await hgetAsync(first100[i], "money");
    arrayOfObj.score = await zscoreAsync("zset", first100[i]);
    arrayOfObj.rank = await zrevrankAsync("zset", first100[i]);
    arrayOfObj.dailyDiff = await (Number(arrayOfObj.rank)-Number(yesterdayRank));
    await first100Obj.push(arrayOfObj);
  }

  if (97 < me ) {
    console.log("true");
    let meAround = {};
    if (me  == totalPlayer-1) {
      meAround = await zrevrangeAsync("zset", me-3, me+1);
    } else if (me  == totalPlayer) {
      meAround = await zrevrangeAsync("zset", me-3, me);
    } else {
      meAround = await zrevrangeAsync("zset", me-3, me+2);
    }
    for (var i = 0; i < meAround.length; i++) {
      let yesterdayRank = await hgetAsync(meAround[i], "yesterdayRank");
      let arrayOfObj = {};
      arrayOfObj.id = meAround[i];
      arrayOfObj.username = await hgetAsync(meAround[i], "username");
      arrayOfObj.country = await hgetAsync(meAround[i], "country");
      arrayOfObj.money = await hgetAsync(meAround[i], "money");
      arrayOfObj.score = await zscoreAsync("zset", meAround[i]);
      arrayOfObj.rank = await zrevrankAsync("zset", meAround[i]);
      arrayOfObj.dailyDiff = await (Number(arrayOfObj.rank)-Number(yesterdayRank));
      await first100Obj.push(arrayOfObj);
    }
  }
  await first100Obj.push(pricePool)
  return first100Obj
}

// Prize Pool ******************************************************************************

const prizePool = async () => {
  let totalPlayer = await zcountAsync("zset", 0, Infinity);
  let userId = await  zrevrangeAsync("zset", 0, -1);
  let totalScore = 0;
  for (var i = 0; i < totalPlayer; i++) {
    let count = await zscoreAsync("zset", userId[i]);
    totalScore += Number(count)
  }
  let prizePoolScore = await totalScore*2/100;
  return Math.round(prizePoolScore)
}


// Distribution of prize pool **************************************************************

const distributeFirst3 = async (perc, id) => {
  let price = await prizePool();
  let player = await  User.findOne({_id:id});
  let playerMoney = await Number(player.money)+price*perc/100;
  let updateMoney = await User.updateOne({_id:id}, {$set:{money:Math.round(playerMoney)}});
  await player.save()
}

const distribute = async (money, id) => {
  let player = await  User.findOne({_id:id});
  let playerMoney = await Number(player.money)+money;
  let updateMoney = await User.updateOne({_id:id}, {$set:{money:Math.round(playerMoney)}});
  await player.save()
}

const findAndGiveMoney = async () => {
  let price = await prizePool();
  let champ = await  findUser(0);
  await distributeFirst3(20,champ);
  let second = await  findUser(1);
  await distributeFirst3(15,second);
  let third = await  findUser(2);
  await distributeFirst3(10,third);
  for (var i = 3; i < 100; i++) {
    let n = await findUser(i);
    await distribute((100-i)*price/4753,n)
  }
}

//Adding players to Redis sorted Sets for leaderboard ****************************************************

const addingRedis = async () => {
  User.find({}, function(err, users) {
    users.forEach(async function (user) {
      await zaddAsync("zset", 0, user._id.toString());
      await hmsetAsync(user._id.toString(), "username", user.username, "country", user.country, "money", user.money, "yesterdayRank", 0);
    });
    // console.log(userId)
  });
}

// End of the week ************************************************

let endOfTheWeek = async () => {
  await findAndGiveMoney();
  await addingRedis();
  console.log("week ended")
}

// End of the day **************************************************

let endOfTheDay = async () => {
  let totalPlayer = await zcountAsync("zset", 0, Infinity);
  for (var i = 0; i < totalPlayer; i++) {
    let user = await findUser(i);
    let yesterdayRank = await zrevrankAsync("zset" ,user);
    await hsetAsync(user, "yesterdayRank", yesterdayRank);
  }
  console.log("day ended")
}

//Score increasement for redis 15 min **********************************************************************
 
let giveRandomScore = async () => {
  let totalPlayer = await zcountAsync("zset", 0, Infinity);
  let n = Math.floor(Math.random()*totalPlayer);
  console.log(n);
  let randomPlayer = await findUser(n);
  console.log(randomPlayer);
  let nPlayerScore = await zscoreAsync("zset", randomPlayer);
  console.log(nPlayerScore);
  let numbernPlayerScore = await Number(nPlayerScore);
  let newScore = Math.floor(Math.random()*5000)+numbernPlayerScore;
  console.log(newScore);
  await zaddAsync("zset", newScore, `${randomPlayer}`);
}

  // Reference: https://levelup.gitconnected.com/how-to-turn-settimeout-and-setinterval-into-promises-6a4977f0ace3
  const asyncInterval = async (callback, ms, triesLeft = 5) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        if (await callback()) {
          resolve();
          clearInterval(interval);
        } else if (triesLeft <= 1) {
          reject();
          clearInterval(interval);
        }
        triesLeft--;
      }, ms);
    });
  }

  const wrapper1 = async () => {
    try {
      await asyncInterval(giveRandomScore, 100, 5);
    } catch (e) {
      console.log('error handling');
    }
    console.log("Done!");
  }
  // wrapper1();


// Export Methods ****************************************************

exports.findAllUsers = (req, res) => {
  User.find()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Something went wrong"
      });
    });
};

exports.findOne = (req, res) => {
  console.log(req.params)
  const id = req.params.id;
  User.findById(id)
    .then(data => {
      if(!data) {
        res.status(404).send({message:"Not found"});
      } else {
        res.send(data)
      }
    })
    .catch(err => {
      res.status(500).send({message:"Something went wrong"})
    })
};

exports.find = (req, res) => {
    const id = req.params.id;
    listLeaderboard(id).then(data => {
      res.json(data)
    });
};

exports.endOfTheWeek = (req, res) => {
   endOfTheWeek();
};

exports.endOfTheDay = (req, res) => {
   endOfTheDay();
};




