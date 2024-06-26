import PreLoader from "./PreLoader.ts";

export default class JsonLoader{
    public data: any;

    constructor(file:string,preloader:PreLoader) {


        preloader.startLoad()
        this.loadFile(file).then(()=>{
            preloader.stopLoad()

        });
    }

    async loadFile(file:string){

        const response = await fetch( "./"+file+".json")

        let text = await response.text();
        this.data = JSON.parse(text);



    }


}
