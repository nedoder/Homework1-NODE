const cheerio = require("cheerio");
const axios = require("axios").default;
const csvToJson = require("csvtojson");
const jsonToCsv = require("objects-to-csv");
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
        return numberLen1 / 20;
    } else {
        numberLen1 = parseInt(numberLen1 / 20) + 1;
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
        return allLinks.flat();
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

// convert csv to json
// function parseCsv() {
//     const pathCsv = "accomodation.csv"
//     csvToJson()
//         .fromFile(pathCsv)
//         .then((jsonObj) => {
//             console.log(jsonObj);
//         });

// }

// load rest of the data
async function loadData() {
    try {
        const allUrl = await allScrapData();
        // let csvObj = parseCsv();
        for (let i = 0; i < allUrl.length; i++) {
            const eachHtml = await fethHtml(allUrl[i]);
            const $ = cheerio.load(eachHtml);
            let url = allUrl[i];
            let idHelp = url.lastIndexOf("/") + 1;
            let id = parseInt(url.slice(idHelp));
            let slike = $("body").find(".fancybox").toArray().map((x) => { return x.attribs.href });
            let naslov = $("body").find("#listing_body > h2 ").text();
            // let lokacija
            // let opis
            // let oglasio
            // let mobilni

            var csvObj = {
                url: url,
                id: id,
                slike: slike,
                naslov: naslov
            }
            new jsonToCsv([csvObj]).toDisk("accomodation.csv", { append: true });

        }




        return csvObj;
    } catch (err) {

        console.log(err);

    }
}


module.exports = { scrapData, allScrapData, findNumPages, loadData };