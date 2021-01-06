const express = require("express");
const upload = require("express-fileupload");
const { docxToPdfFromPath, initIva } = require("iva-converter");
const { writeFileSync } = require("fs");
const { basename } = require("path");
const path = require('path');
const fs = require('fs');
const handlebars = require("express-handlebars");
var counter = require('./counter.json');
counterPath = './counter.json';
var outputVal = counter.counter;
var downloadPath = "";

initIva("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmY0OTE2N2U0M2QwYTAwMjlmZTMxMDAiLCJjcmVhdGVkQXQiOjE2MDk4NjM1Mjc0OTIsImlhdCI6MTYwOTg2MzUyN30.AZGINcsKbohbVBJXN_JTkwJrmx19AQ026jt6-4Vz-nw");
const app = express();
app.use(upload());

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render('main', { layout: 'index', outputVal, downloadPath });
});

app.post("/", (req, res) => {
    if (req.files.upfile) {
        const file = req.files.upfile;
        const name = file.name;
        const type = file.mimetype;
        const uploadpath = __dirname + "/uploads/" + name;
        if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            file.mv(uploadpath, (err) => {
                if (err) {
                    res.send("Error occured!");
                } else {
                    res.send("File uploaded!");
                    const filePath = path.join(__dirname, '/uploads/' + name);
                    docxToPdfFromPath(filePath)
                        .then((pdfFile) => {
                            counter.counter++;
                            fs.writeFileSync(counterPath, JSON.stringify(counter));
                            writeFileSync(basename(filePath).replace(".docx", ".pdf"), pdfFile);

                        })
                    downloadPath = path.join(__dirname, basename(filePath).replace(".docx", ".pdf"));
                    // downloadPath.toString();

                }


            });
        } else {
            res.send("File is not word!");

        }

    }
});



app.listen(3000, function() {
    console.log("Connected!");
});