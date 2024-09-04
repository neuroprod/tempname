const svgtofont = require('svgtofont');
const path = require('path');
const generateBMFont = require('msdf-bmfont-xml');
const fs = require('fs');
const sharp = require("sharp");

function go() {

    let opt= {};
    opt.outputType ='json';
    makeFont('fonts/icons.ttf',"icons")
   // makeFont('testfont.ttf',"icons")
    makeFont('Roboto-Regular.ttf',"regular")
    makeFont('FiraSans-Black.ttf',"bold")

}

function makeSVGFont(){


    svgtofont({
        src: path.resolve(process.cwd(), 'svg'), // svg path
        dist: path.resolve(process.cwd(), 'fonts'), // output path
        fontName: 'icons', // font name
        css: false, // Create CSS files.
        useNameAsUnicode: true,

        fontHeight: 42,
    }).then(() => {
        go()
    });


}
var doneCount =0;
function checkDone(){
    doneCount++
    if(doneCount<3)return;
    console.log(doneCount)
    combine().then(()=>{


        fs.copyFileSync("font.png","../public/font.png")
        fs.copyFileSync("icons.json","../src/webgpu/lib/UI/draw/icons.json")
        fs.copyFileSync("regular.json","../src/webgpu/lib/UI/draw/regular.json")
        fs.copyFileSync("bold.json","../src/webgpu/lib/UI/draw/bold.json")
        console.log("done")

    })

}

async function combine(){
    const regBuffer = await sharp('regular.png').toBuffer()
    const boldBuffer = await sharp('bold.png').toBuffer()
    const iconBuffer = await sharp('icons.png').toBuffer()
    const image = await sharp('font_white.png')
        .composite([{
            input: regBuffer, // Can I put Sharp object here?
            top:0,
            left:0
            // I want bottom right with 10px margin
        },{
            input: boldBuffer, // Can I put Sharp object here?
            top:0,
            left:256
            // I want bottom right with 10px margin
        },{
            input: iconBuffer, // Can I put Sharp object here?
            top:0,
            left:512
            // I want bottom right with 10px margin
        }]).toFile('font.png');

}

function makeFont(name,targetName){
    let opt= {};
    opt.outputType ='json';
    opt.distanceRange =4;
//opt.fieldType="sdf"
    generateBMFont(name, opt,(error, textures, font) => {
        if (error) throw error;
        textures.forEach((texture, index) => {
            fs.writeFile(targetName+".png", texture.texture, (err) => {
                if (err) throw err;
            });
        });
        fs.writeFile(targetName+".json", font.data, (err) => {
            if (err) throw err;
        });

        checkDone()
    });

}
//go();
makeSVGFont()
