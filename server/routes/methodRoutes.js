module.exports = app => {
  const methods = require("../methods/methods.js");

  let router = require("express").Router();

  router.get("/endOfTheDay", methods.endOfTheDay);
  router.get("/endOfTheWeek", methods.endOfTheWeek);
  router.get("/giveRandomScore", methods.giveRandomScore);
  router.get("/:id", methods.find);

  app.use("/api/users", router);
}