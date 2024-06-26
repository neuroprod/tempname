const fs = require("fs");

module.exports = {
    generate: generate,

};






function generate(){
    let dir = "../public/data"


    let folders =fs.readdirSync(dir)

    let modelNamesString ="//generated by server\n\nexport var ModelNames = {\n";

    for(let folder of folders){
        let buffer = fs.readFileSync(dir+"/"+folder+"/data.json");
        let obj = JSON.parse(buffer.toString());
        let name = obj.name;

        for(let mesh of obj.meshes){
            let meshName =mesh.name;

            let modelName = name+"_"+meshName
            modelNamesString+=modelName.toUpperCase()+": '"+modelName+"',"+"\n"

        }
    }

    modelNamesString +="}"
    fs.writeFileSync("../src/webgpu/data/ModelNames.ts", modelNamesString);




     let j = JSON.stringify(folders)
    let path = "../public/";
    if(!fs.existsSync(path)) fs.mkdirSync(path);


    fs.writeFileSync(path + '/data.json', j);

}
generate()
