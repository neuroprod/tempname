const generateBMFont = require('msdf-bmfont-xml');
const fs = require('fs');

function go() {

    let opt= {};
    opt.outputType ='json';

makeFont('Inter-Bold.ttf')
    makeFont('Inter-Regular.ttf')

}
function makeFont(name){
    let opt= {};
    opt.outputType ='json';

    generateBMFont(name, opt,(error, textures, font) => {
        if (error) throw error;
        textures.forEach((texture, index) => {
            fs.writeFile(texture.filename+".png", texture.texture, (err) => {
                if (err) throw err;
            });
        });
        fs.writeFile(font.filename, font.data, (err) => {
            if (err) throw err;
        });
    });

}
go();
