const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require("fs");
const sharp = require('sharp');


const port = 3001
var upload = multer({dest:'./temp/'});



const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
    console.log(`server started on ${port}`)
})
app.post('/save',upload.single('file') ,(req, res) => {

    console.log(req.body)
    console.log(req.file)
     sharp("./"+req.file.path).webp().toFile("./"+req.body.destination+"/texture.webp").then(()=>{

     })
  //  })
    // Save the data of user that was sent by the client

    // Send a response to client that will show that the request was successfull.
    res.send({
        message: 'New user was added to the list',
    });


})


