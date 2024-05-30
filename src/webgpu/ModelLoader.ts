import Renderer from "./lib/Renderer.ts";
import PreLoader from "./lib/PreLoader.ts";
import TextureLoader from "./lib/textures/TextureLoader.ts";

export default class ModelLoader{
    private renderer: Renderer;
    public data:any =[]
    constructor(renderer:Renderer,preloader:PreLoader) {
        this.renderer =renderer;
        preloader.startLoad()
        this.loadBase( preloader).then(()=>{
            preloader.stopLoad()

        });
    }

    async loadBase( preloader:PreLoader){

        const response = await fetch( "./"+"data.json")

        let text = await response.text();
        let dataArr = JSON.parse(text);


        for (let d of dataArr){
            preloader.startLoad()
           this.loadData(d,preloader).then(()=>{

               preloader.stopLoad()
           })
        }
    }

    async loadData( folder:string,preLoader:PreLoader){

        preLoader.startLoad()
        let texture=new TextureLoader(this.renderer,"./data/"+folder+"/texture.webp")
        texture.onComplete =()=>{

            preLoader.stopLoad()
        }

        const response = await fetch( "./data/"+folder+"/data.json")

        let text = await response.text();
        let data = JSON.parse(text);
        data.texture =texture;
        this.data.push(data)


    }

}
