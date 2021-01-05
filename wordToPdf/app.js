const express = require("express");
const upload = require("express-fileupload");
const libre = require("libreoffice-convert");
const path = require('path');
const fs = require('fs');
const extend = '.pdf';


const app = express();
app.use(upload());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
    console.log(req.files);
    if (req.files.upfile) {
        const file = req.files.upfile;
        console.log(req.files.upfile);
        const name = file.name;
        const type = file.mimetype;
        const uploadpath = __dirname + "/uploads/" + name;
        if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            file.mv(uploadpath, (err) => {
                if (err) {
                    console.log("File upload failed!", name, err);
                    res.send("Error occured!");

                } else {
                    console.log("File uploaded!", name);
                    res.send("Done!");
                    const enterPath = path.join(__dirname, '/uploads/' + name);
                    const outputPath = path.join(__dirname, '/uploads/' + `name${ extend }`);
                    const fileConv = fs.readFileSync(enterPath);
                    libre.convert(fileConv, extend, undefined, (err, done) => {
                        if (err) {
                            console.log(`Error converting file: ${err}`);
                        }
                        fs.writeFileSync(outputPath, done);
                    });
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