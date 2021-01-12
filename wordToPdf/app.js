const express = require("express");
const upload = require("express-fileupload");
const { docxToPdfFromPath, initIva } = require("iva-converter");
const { writeFileSync } = require("fs");
const { basename } = require("path");
const path = require('path');
const fs = require('fs');
const handlebars = require("express-handlebars");
var nodemailer = require('nodemailer');
var counter = require('./counter.json');
counterPath = path.join(__dirname, './counter.json');
var outputVal = counter.counter;
var downloadPath = path.join(__dirname, 'converter.pdf');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require('dotenv').config();


initIva("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmZiYTAxN2EyMzhjYTAwMjk0OGNmYWYiLCJjcmVhdGVkQXQiOjE2MTAzMjYwNDAwMTUsImlhdCI6MTYxMDMyNjA0MH0.Pg6_WVVhh6oHg8L_9lD0ug7lEXQbgGloCFSspaOnFOw");
const app = express();
app.use(upload());

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

app.use(express.static("public"));
app.use("converter.pdf", express.static(__dirname))


app.get("/", (req, res) => {
    res.render('main', { layout: 'index', outputVal, downloadPath });
});





app.post("/", (req, res) => {
    if (req.files === null) {
        res.send("No file uploaded!");
    } else if (req.files.upfile) {
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
                            writeFileSync("converter.pdf", pdfFile);
                            fs.unlinkSync(filePath);

                        })
                        .catch((err) => {
                            console.error(err);
                        });




                }


            });
        } else {
            res.send("File is not word!");

        }


    }
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'converternodejs@gmail.com',
        pass: "nodejesuper1"
    }
});


app.post("/send", (req, res) => {
    if (req.body.email) {
        var mailOptions = {
            from: 'converternodejs@gmail.com',
            to: req.body.email,
            subject: 'Sending your converted PDF file',
            text: 'We converted your .docx file to PDF. Hope you are satisfied with the result.',
            attachments: {
                path: downloadPath,
            }

        };


        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.redirect('/');
    } else {
        res.redirect('/');

    }

});


app.listen(process.env.PORT || 3000, function() {
    console.log("Connected!");
});