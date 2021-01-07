const cheerio = require("cheerio");
const axios = require("axios").default;
const jsonToCsv = require("jsonexport");
const csvToJson = require("papaparse");
const fs = require("fs");
const fethHtml = async url => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch {
        console.error(
            `ERROR: An error occurred while trying to fetch the URL: ${url}`
        );
    }
};

// finding the number of pages
const findNumPages = async() => {
    const urlNum = "https://www.realitica.com/index.php?for=Najam&pZpa=Crna+Gora&pState=Crna+Gora&type%5B%5D=&price-min=&price-max=&qry=&lng=hr";
    const htmlNum = await fethHtml(urlNum);
    const $ = cheerio.load(htmlNum);
    const numberLen = $('body').find('#left_column_holder > div > span').toArray().map((x) => { return $(x).text() });
    numberLen1 = parseInt(numberLen[0].slice(-4));
    if (numberLen1 % 20 === 0) {
        console.log(numberLen1);
        return numberLen1 / 20;
    } else {
        numberLen1 = parseInt(numberLen1 / 20) + 1;
        console.log(numberLen1);
        return numberLen1;
    }

};

// scraping all links from all the pages
async function allScrapData() {
    try {
        let allLinks = [];
        const length = await findNumPages();
        for (let i = 1; i < length; i++) {
            let linkUrl = `https://www.realitica.com/?cur_page=${i}&for=Najam&pZpa=Crna+Gora&pState=Crna+Gora&type%5B%5D=&lng=hr`;
            allLinks.push(await scrapData(linkUrl));
        }
        return allLinks;
    } catch {
        console.log("Error occured!");
    }
}

// scraping links from one page at the time
async function scrapData(url) {
    const html = await fethHtml(url);
    const $ = cheerio.load(html);
    const searchResults = $("body").find(".thumb_div > a ").toArray().map((x) => { return x.attribs.href });
    return searchResults;
};



module.exports = { scrapData, allScrapData, findNumPages };