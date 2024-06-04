import Renderer from "../lib/Renderer.ts";
import Model from "../lib/model/Model.ts";
import ModelPreviewMaterial from "../modelMaker/ModelPreviewMaterial.ts";
import ExtrudeMesh from "../lib/mesh/ExtrudeMesh.ts";
import {Vector2, Vector3} from "@math.gl/core";


export default class ModelPool {
    private renderer: Renderer;
    private data: any;

    constructor(renderer:Renderer,data:any) {

        this.renderer =renderer;
        this.data =data;


    }
    public getModelByName(name:string)
    {
        let names = name.split("_")
        if(names.length!=2) {
            console.log("error making model")
        }
        let modelData =this.getObjByName(this.data,names[0]);
        let meshData =this.getObjByName(modelData.meshes,names[1]);


        let model =new Model(this.renderer,name);
        model.material =new ModelPreviewMaterial(this.renderer,"preViewMaterial");
        let textureName  ="./data/"+names[0]+"/texture.webp"
        let texture = this.renderer.textureHandler.texturesByLabel[textureName];

       model.material.setTexture("colorTexture",texture);

        let mesh   =new ExtrudeMesh(this.renderer,name);

        let points :Array<Vector2>=[];
        for(let i=0;i<meshData.points.length;i+=2){
            points.push(new Vector2(meshData.points[i],meshData.points[i+1]));
        }

        mesh.setExtrusion(points,0.02,new Vector3(meshData.center))
        model.mesh  =mesh;

        return model;

    }
    private getObjByName(arr:Array<any>,name:string){
        for(let obj of  arr){
            if(obj.name ==name){
            return obj;
            }
        }
        return null;

    }

}
