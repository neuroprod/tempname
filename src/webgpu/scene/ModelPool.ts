import Renderer from "../lib/Renderer.ts";
import Model from "../lib/model/Model.ts";
import ModelPreviewMaterial from "../modelMaker/ModelPreviewMaterial.ts";
import ExtrudeMesh from "../lib/mesh/ExtrudeMesh.ts";
import {Vector2, Vector3} from "@math.gl/core";
import Object3D from "../lib/model/Object3D.ts";
import SceneObject3D from "../shared/SceneObject3D.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import {ModelNames} from "../data/ModelNames.ts";
import Box from "../lib/mesh/geometry/Box.ts";
import GBufferMaterial from "../render/GBuffer/GBufferMaterial.ts";


export default class ModelPool {
    private renderer: Renderer;
    private data: any;
    public modelSelect:Array<SelectItem>=[]
    constructor(renderer:Renderer,data:any) {

        this.renderer =renderer;
        this.data =data;

        for (let m of data){

          let mN = m.name;
            let meshes = m.meshes
            this.modelSelect.push(new SelectItem("cube","cube"))
           for (let mesh of meshes){
               let n =mN+"_"+mesh.name
               let selectItem =new SelectItem(n,n)
               this.modelSelect.push(selectItem)

           }
        }

    }
    public getModelByName(name:string,newName="")
    {

        if(name =="cube"){

            let model =new Model(this.renderer,name);
            model.material =new GBufferMaterial(this.renderer,"preViewMaterial");
            model.mesh  =new Box(this.renderer);
            if(newName=="")newName =name;
            let obj3D =new SceneObject3D(this.renderer,newName)
            obj3D.addChild(model)
            obj3D.model =model;
            return obj3D;

        }
        let names = name.split("_")
        if(names.length!=2) {
            console.log("error making model")
        }
        let modelData =this.getObjByName(this.data,names[0]);
        let meshData =this.getObjByName(modelData.meshes,names[1]);


        let model =new Model(this.renderer,name);
        model.material =new GBufferMaterial(this.renderer,"gMat");
        let textureName  ="./data/"+names[0]+"/texture.webp"
        let texture = this.renderer.textureHandler.texturesByLabel[textureName];

        model.material.setTexture("colorTexture",texture);

        let mesh   =new ExtrudeMesh(this.renderer,name);

        let points :Array<Vector2>=[];
        for(let i=0;i<meshData.points.length;i+=2){
            points.push(new Vector2(meshData.points[i],meshData.points[i+1]));
        }

        mesh.setExtrusion(points,0.01,new Vector3(meshData.center))
        model.mesh  =mesh;

        if(newName=="")newName =name;
        let obj3D =new SceneObject3D(this.renderer,newName)
        obj3D.addChild(model)
        obj3D.model =model;
        return obj3D;

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
