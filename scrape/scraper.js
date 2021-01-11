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
            let lokacija = (eachHtml.match(/<strong>Lokacija<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Lokacija<\/strong>: .*?<br \/>/)[0].slice(27, -6);
            let vrsta = (eachHtml.match(/<strong>Vrsta<\/strong>: .*?<br\/>/) === null) ? " " : eachHtml.match(/<strong>Vrsta<\/strong>: .*?<br\/>/)[0].slice(24, -5);
            let podrucje = (eachHtml.match(/<strong>Područje<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Područje<\/strong>: .*?<br \/>/)[0].slice(26, -6);
            let broj_soba = (eachHtml.match(/<strong>Spavaćih Soba<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Spavaćih Soba<\/strong>: .*?<br \/>/)[0].slice(31, -6);
            let broj_kupatila = (eachHtml.match(/<strong>Kupatila<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Kupatila<\/strong>: .*?<br \/>/)[0].slice(26, -6);
            let cijena = (eachHtml.match(/<strong>Cijena<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Cijena<\/strong>: .*?<br \/>/)[0].slice(31, -6);
            let povrsina = (eachHtml.match(/<strong>Stambena Površina<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Stambena Površina<\/strong>: .*?<br \/>/)[0].slice(35, -42);
            let zemljiste = (eachHtml.match(/<strong>Zemljište<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Zemljište<\/strong>: .*?<br \/>/)[0].slice(27, -40);
            let parking = (eachHtml.match(/<strong>Parking Mjesta<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Parking Mjesta<\/strong>: .*?<br \/>/)[0].slice(32, -6);
            let od_mora = (eachHtml.match(/<strong>Od Mora \(m\)<\/strong>: .*?<br\/>/) === null) ? " " : eachHtml.match(/<strong>Od Mora \(m\)<\/strong>: .*?<br\/>/)[0].slice(29, -5);
            let novogradnja = (eachHtml.match(/<strong>Novogradnja.*<\/strong>/) === null) ? false : true;
            let klima = (eachHtml.match(/<strong>Klima.*<\/strong>/) === null) ? false : true;
            let opis = (eachHtml.match(/<strong>Opis<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Opis<\/strong>: .*?<br \/>/)[0].slice(22, -6);
            let oglasio = (eachHtml.match(/<strong>Oglasio<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Oglasio<\/strong>: .*?<br \/>/)[0].slice(25, -6);
            let mobilni = (eachHtml.match(/<strong>Mobitel<\/strong>: .*?<br \/>/) === null) ? " " : eachHtml.match(/<strong>Mobitel<\/strong>: .*?<br \/>/)[0].slice(25, -6);
            let zadnja_promjena = (eachHtml.match(/<strong>Zadnja Promjena<\/strong>: .*?\n<br \/>/) === null) ? " " : eachHtml.match(/<strong>Zadnja Promjena<\/strong>: .*?\n<br \/>/)[0].slice(33, -6);



            var csvObj = {
                Url: url,
                ID: id,
                Slike: slike,
                Naslov: naslov,
                Lokacija: lokacija,
                Vrsta: vrsta,
                Područje: podrucje,
                Broj_soba: broj_soba,
                Broj_kupatila: broj_kupatila,
                Cijena: cijena,
                Površina: povrsina,
                Zemljište: zemljiste,
                Parking: parking,
                Od_mora: od_mora,
                Novogradnja: novogradnja,
                Klima: klima,
                Opis: opis,
                Oglasio: oglasio,
                Mobilni: mobilni,
                Poslednja_promjena: zadnja_promjena
            }
            new jsonToCsv([csvObj]).toDisk("accomodation.csv", { append: true });

        }




        return csvObj;
    } catch (err) {

        console.log(err);

    }
}


module.exports = { scrapData, allScrapData, findNumPages, loadData };