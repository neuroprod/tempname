import Renderer from "../lib/Renderer.ts";
import PreLoader from "../lib/PreLoader.ts";

import SceneObject3D from "./SceneObject3D.ts";

import ProjectData from "./ProjectData.ts";
import Model from "../lib/model/Model.ts";

 class SceneHandler{
     private renderer!: Renderer;
     private scenesData: Array<any>=[];
     public sceneDataByID: Map<string, any> = new Map<string, any>();
     public modelsByLoadID: { [id: string]: SceneObject3D } = {};
     usedModels: Array<Model> = [];

     root!:SceneObject3D;



    async init(renderer:Renderer,preloader:PreLoader)
    {
        this.renderer = renderer;
        this.root = new SceneObject3D(renderer,"MainRoot")


        const response = await fetch( "./scenes.json")

        let text = await response.text();
        let scenesIDS= JSON.parse(text);
        let pArray:Array<Promise<Response>> =[]

        for(let folder of   scenesIDS){

            let file  = "./scenes/"+folder+".json"
            let p =  fetch( file)


            pArray.push(p);
        }
        await Promise.all(pArray);

        for(let pr of pArray){

            let text  =(await pr).text()
            await text.then((value)=>{
                let sceneData = JSON.parse(value)
                this.scenesData.push(sceneData);
                this.sceneDataByID.set(sceneData.id,sceneData)

                console.log("loadScenes")
            })
        }
    }


        async setScene(sceneId:string){
            //save currentscenes?


            //remove and delete current scene
            ProjectData.setNewScene()

            let newData =this.sceneDataByID.get(sceneId)
            if(newData){

                this.parseSceneData(newData.scene)
            }


        }

     private parseSceneData(sceneData: any) {

         for (let d of sceneData) {


             let sceneObj: SceneObject3D | null = null;
             if (d.meshId.length > 0 && d.projectId.length > 0) {
                 sceneObj = ProjectData.getModel(d);

             } else if (d.isText) {
               //  sceneObj = this.makeSceneObjectWithText(d.label, d.text)
             } else {
                 sceneObj = new SceneObject3D(this.renderer, d.label)
                 sceneObj.UUID = d.id;

             }
             if (sceneObj) {

                // this.sceneModelsByName[sceneObj.label] =sceneObj

                 sceneObj.setPosition(d.position[0], d.position[1], d.position[2])
                 sceneObj.setRotation(d.rotation[0], d.rotation[1], d.rotation[2], d.rotation[3])

                 this.modelsByLoadID[d.id] = sceneObj;

                 let  parent =this.modelsByLoadID[d.parentID]
                     if(!parent) parent=this.root;
                     parent.addChild(sceneObj)
                 if (sceneObj.model) {
                     if (d.scale) {
                         sceneObj.model.setScale(d.scale[0], d.scale[1], d.scale[2])
                     }
                     sceneObj.setObjectData(d)

                     this.usedModels.push(sceneObj.model);
                     if(sceneObj.needsHitTest) {
                     //    this.hitTestModels.push(sceneObj.model);
                     }
                     if(sceneObj.needsTrigger) {
                       //  this.triggerModels.push(sceneObj);
                     }
                 }// if(m.model)
             }
         }
     }
 }

export default new SceneHandler()
