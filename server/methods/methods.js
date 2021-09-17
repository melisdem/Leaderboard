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

//Adding players to Redis sorted Sets for leaderboard ****************************************************

const addingRedis = async () => {
  User.find({}, function(err, users) {
    users.forEach(async function (user) {
      await zaddAsync("zset", 0, user._id.toString());
      await hmsetAsync(user._id.toString(), "username", user.username, "country", user.country, "money", user.money, "yesterdayRank", 0);
    });
  });
}

addingRedis()

const findUser = async (n) => {
  let user = await zrevrangeAsync("zset",n ,n);
  return await user[0]
}

const constructObject = async (elm, myRank) => {
    let objOfArray = {};
    let yesterdayRank = await hgetAsync(elm, "yesterdayRank");
    let rank = await zrevrankAsync("zset", elm);
    objOfArray.id = elm;
    objOfArray.username = await hgetAsync(elm, "username");
    objOfArray.country = await hgetAsync(elm, "country");
    objOfArray.money = await hgetAsync(elm, "money");
    objOfArray.score = await zscoreAsync("zset", elm);
    objOfArray.rank = await rank+1;
    objOfArray.dailyDiff = await (-Number(objOfArray.rank)+1+Number(yesterdayRank));
    if (myRank == rank) {
      objOfArray.isMe = await true;
    } else {
      objOfArray.isMe = await false;
    }
    return objOfArray;
}

const listLeaderboard = async(myId) => {
  let first100Obj = [];
  let totalPlayer = await zcountAsync("zset", 0, Infinity);
  let myRank = await zrevrankAsync("zset", myId);
  let first100 = await  zrevrangeAsync("zset", 0, 99);

  if (myRank<=97) {  
    for (var i = 0; i < 100; i++) {
      let player = await constructObject(first100[i],myRank);
      await first100Obj.push(player);
    }
  } 
  else if (98<=myRank && myRank<=102) {
    for (var i = 0; i < myRank+3; i++) {
      let meAround = await  zrevrangeAsync("zset", 0, myRank+2);
      let player = await constructObject(meAround[i],myRank);
      await first100Obj.push(player);
    }        
  } 
  else if (myRank>=103 && myRank<totalPlayer-2) {
    for (var i = 0; i < 100; i++) {
      let player = await constructObject(first100[i],myRank);
      await first100Obj.push(player);
    };
    for (var i = 0; i < 6; i++) {
      let meAround = await  zrevrangeAsync("zset", myRank-3, myRank+2);
      let player = await constructObject(meAround[i],myRank);
      await first100Obj.push(player);
    }    
  } 
  else if (myRank == totalPlayer-2) {
    for (var i = 0; i < 100; i++) {
      let player = await constructObject(first100[i],myRank);
      await first100Obj.push(player);
    };
    let meAround = await  zrevrangeAsync("zset", myRank-3, myRank+1);
    for (var i = 0; i < 5; i++) {
      let player = await constructObject(meAround[i],myRank);
      await first100Obj.push(player);
    } 
  }
  else if (myRank == totalPlayer-1) {
    for (var i = 0; i < 100; i++) {
      let player = await constructObject(first100[i],myRank);
      await first100Obj.push(player);
    };
    let meAround = await  zrevrangeAsync("zset", myRank-3, myRank);
    for (var i = 0; i < 4; i++) {
      let player = await constructObject(meAround[i],myRank);
      await first100Obj.push(player);
    } 
  }      
  return await first100Obj
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
  console.log(playerMoney);
  let updateMoney = await User.updateOne({_id:id}, {$set:{money:Math.round(playerMoney)}});
  await player.save();
  let redisPlayer = await hsetAsync(id, "money", playerMoney);
}

const distribute = async (money, id) => {
  let player = await  User.findOne({_id:id});
  let playerMoney = await Number(player.money)+money;
  let updateMoney = await User.updateOne({_id:id}, {$set:{money:Math.round(playerMoney)}});
  await player.save();
  let redisPlayer = await hsetAsync(id, "money", playerMoney);
}

const findAndGiveMoney = async () => {
  let price = await prizePool();
  console.log(price);
  let champ = await  findUser(0);
  console.log(champ);
  await distributeFirst3(20,champ);
  let second = await  findUser(1);
  await distributeFirst3(15,second);
  let third = await  findUser(2);
  await distributeFirst3(10,third);
  for (var i = 3; i < 100; i++) {
    let n = await findUser(i);
    await distribute((100-i)*price/4753,n)
  };
}


// End of the week ************************************************

let endWeek = async () => {
  let users = await zrevrangeAsync("zset", 0, -1);
  for (var i = 0; i < users.length; i++) {
    let user = await users[i];
    // await hsetAsync(user, "yesterdayRank", 0);
    await zaddAsync("zset",0,`${user}`);
    let yesterdayRank = await zrevrankAsync("zset" ,user);
    await hsetAsync(user, "yesterdayRank", yesterdayRank);
  }
  console.log("week ended")  
}

let endOfTheWeek = async () => {
  await findAndGiveMoney();
  await endWeek();
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


//Score increasement for redis **********************************************************************
 
let giveRandomScore = async () => {
  let totalPlayer = await zcountAsync("zset", 0, Infinity);
  let n = Math.floor(Math.random()*totalPlayer);
  let randomPlayer = await findUser(n);
  let nPlayerScore = await zscoreAsync("zset", randomPlayer);
  let numbernPlayerScore = await Number(nPlayerScore);
  let newScore = Math.floor(Math.random()*5000)+numbernPlayerScore;
  await zaddAsync("zset", newScore, `${randomPlayer}`);
  console.log(randomPlayer);
  console.log(newScore);
};

let giveRandomScore100 = async () => {
  for (var i = 0; i < 100; i++) {
   await giveRandomScore();
  }
   console.log("done")
}

// Find random 5 user
let random5id = async () => {
  let users = [] ;
  for (var i = 0; i < 5; i++) {
    let random = Math.round(Math.random()*10000);
    let user = await findUser(random);
    users.push(user);
  }
  return users
}


// setInterval for random scores, endOfTheDay and endOfTheWeek

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
    await asyncInterval(giveRandomScore100, 900000, 100000);
  } catch (e) {
    console.log('error handling');
  }
  console.log("Done!");
}
wrapper1();


const wrapper2 = async () => {
  try {
    await asyncInterval(endOfTheDay, 86400000, 100000);
  } catch (e) {
    console.log('error handling');
  }
  console.log("Done!");
}
wrapper2();

const wrapper3 = async () => {
  try {
    await asyncInterval(endOfTheWeek, 604800000, 100000);
  } catch (e) {
    console.log('error handling');
  }
  console.log("Done!");
}
wrapper3();


// Export Methods ****************************************************

exports.find = (req, res) => {
    const id = req.params.id;
    listLeaderboard(id).then(data => {
      res.json(data)
    });
};

exports.endOfTheWeek = (req, res) => {
  endOfTheWeek();
  random5id().then(data => {
   res.json(data)
  })
};

exports.endOfTheDay = (req, res) => {
  endOfTheDay();
  random5id().then(data => {
    res.json(data)
  })
};

exports.giveRandomScore = (req, res) => {
   giveRandomScore100();
   random5id().then(data => {
    res.json(data)
   })   
};



