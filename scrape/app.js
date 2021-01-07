const express = require("express");
const app = express();
const axios = require("axios");
const path = require("path");
const cron = require("node-cron")
const scrapData = require("./scraper").allScrapData;

app.get("/", async function(req, res) {
    const result = await scrapData();
    res.send(result);

});

var task = cron.schedule('* * 23 * *', () => {
    console.log("Running a task every day!");

});

task.start();

app.listen(process.env.PORT || 3000, function() {
    console.log("Connected!");
});



process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
});