const fs = require("fs");

module.exports = {
    generate: generate,

};






function generate(){
    let dir = "../public/data"


    let folders =fs.readdirSync(dir)
     let j = JSON.stringify(folders)
    let path = "../public/";
    if(!fs.existsSync(path)) fs.mkdirSync(path);


    fs.writeFileSync(path + '/data.json', j);

}
generate()
