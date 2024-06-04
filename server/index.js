

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require("fs");
const sharp = require('sharp');


const port = 3001
var upload = multer({dest:'./temp/'});

function generate(){
    let dir = "../public/data"


    let folders =fs.readdirSync(dir)
    let j = JSON.stringify(folders)
    let path = "../public/";
    if(!fs.existsSync(path)) fs.mkdirSync(path);


    fs.writeFileSync(path + '/data.json', j);

}

const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
    console.log(`server started on ${port}`)
})
app.post('/save',upload.single('file') ,(req, res) => {

    //console.log(req.body)



    //console.log(req.file)
    let path = "../public/data/"+req.body.destination+"/";
    if(!fs.existsSync(path)) fs.mkdirSync(path);


    fs.writeFileSync(path + '/data.json',  req.body.data);


    fs.copyFileSync("./"+req.file.path,path+"texture.png");

     sharp("./"+req.file.path).webp().toFile(path+"/texture.webp").then(()=>{
            fs.rmSync("./"+req.file.path);
            generate();
            console.log("save done")
     })

    res.send({
        message: 'ok',
    });


})

app.post('/saveScene',(req, res) => {



    console.log(req.body.data)


    //console.log(req.file)
    let path = "../public/";



    //fs.writeFileSync(path + '/'+req.body.fileName+'.json',  req.body.data);



    res.send({
        message: 'ok',
    });


})


