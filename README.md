# Leaderboard

1.You must create Leaderboard database. For that you must execute index.js file in seeds folder:

  node server/seeds/index.js

 This will add 10.000 player to MongoDB
 database:Leaderboard,
 collection:users

2.open redis-server 

3. Execute in server folder node js

 node server.js

4. Execute in client folder react

  npm start

  
5.First page you can see random 5 users from redis. If you click one of them you can see first 100 players, player from url id and around players of player.

6.That react page is leaderboard list. Above you can see button that simulate end of the day, end of the week and random scores that players win. However, these functions automatically execute by set ınterval. 