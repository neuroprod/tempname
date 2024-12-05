import PreLoader from "../lib/PreLoader.ts";
import Renderer from "../lib/Renderer.ts";

import Project from "./Project.ts";
import Model from "../lib/model/Model.ts";
import ProjectMesh, {MeshType} from "./ProjectMesh.ts";

import SceneObject3D from "./SceneObject3D.ts";
import ShadowDepthMaterial from "../render/shadow/ShadowDepthMaterial.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import FontMesh from "../modelMaker/FontMesh.ts";

import ShadowFontDepthMaterial from "../render/shadow/ShadowFontDepthMaterial.ts";
import Font from "./Font.ts";
import FontMaterial from "../render/TransparentMaterials/FontMaterial.ts";

class ProjectData {
    private folders!: any;

    projects: Array<Project> = [];
    public projectsMap: Map<string, Project> = new Map<string, Project>();
    public projectsNameMap: Map<string, Project> = new Map<string, Project>();
    private renderer!: Renderer;
    private defaultShadowMaterial!: ShadowDepthMaterial;
    projectSelectItems: Array<SelectItem> = [];

    private defaultFontShadowMaterial!: ShadowFontDepthMaterial;
    font!: Font;
    copy: any;
    constructor() {
    }
   async init(renderer:Renderer,preloader:PreLoader,){

       this.renderer =renderer;

       this.defaultShadowMaterial = new ShadowDepthMaterial(renderer, "shadowDepth");

       this.defaultFontShadowMaterial = new ShadowFontDepthMaterial(renderer, "fontDepthMaterial");
       this.font = new Font()



       const response = await fetch( "./data.json")

       let text = await response.text();
       this.folders= JSON.parse(text);
       let pArray:Array<Promise<Response>> =[]

       for(let folder of this.folders){

            let file  = "./data/"+folder+"/data.json"
            let p =  fetch( file)


            pArray.push(p);
       }
       await Promise.all(pArray);

       for(let pr of pArray){

        let text  =(await pr).text()
        await text.then((value)=>{
            let projectData = JSON.parse(value)

            let p = new Project(renderer)

            p.setData(projectData);
            this.addProject(p)
        })
       }
       const responseW = await fetch( "./websiteCopy.json")

       let textW = await responseW.text();
       this.copy = JSON.parse(textW);




    }
    private addProject(p: Project) {
        this.projects.push(p)
        this.projectsNameMap.set(p.name, p);
        this.projectsMap.set(p.id, p);

    }

    setNewScene() {
        for(let p of this.projects){
            p.clearBaseTexture()
        }
    }

    getModel(d: any) {
        let project = this.projectsMap.get(d.projectId)

        if (!project) return null
        let projMesh = project.getProjectMeshByID(d.meshId);
        if (!projMesh) return null

        let m = this.makeSceneObjectWithMesh(project, projMesh, d.label, d.id);
        return m;


    }

   public makeSceneObjectWithMesh(project: Project, projMesh: ProjectMesh, label:string, id:string)
    {
        let model = new Model(this.renderer,  projMesh.id);
        model.mesh =  projMesh.getMesh();
        if ( projMesh.meshType == MeshType.TRANS_PLANE) {

            model.material =    project.getGBufferClipMaterial();
            model.setMaterial("shadow", project.getShadowClipMaterial())

        } else {

            model.material = project.getGBufferMaterial()
            model.setMaterial("shadow", this.defaultShadowMaterial)
        }


        let obj3D = new SceneObject3D(this.renderer, label)
        obj3D.addChild(model)
        obj3D.model = model;
        obj3D.meshId =  projMesh.id;
        obj3D.projectId = project.id;

       /* if (m.meshType == MeshType.TRANS_PLANE) {
            // obj3D.transparent =true;
        }*/
        if (id.length > 1) {
            obj3D.UUID = id;
        }



        return obj3D;

    }

    makeSelectItems() {
        this.projectSelectItems = []
        for (let p of this.projects) {
            if (p.meshes.length > 0) {
                this.projectSelectItems.push(new SelectItem(p.name, p))
                p.makeSelectItems();
            }

        }


    }
    makeSceneObjectWithText(name: string, text: string) {

        let model = new Model(this.renderer, "textModel")
        model.transparent =true;
        let mesh = new FontMesh(this.renderer, 'fontMesh');
        let textData =text;
        if(text.startsWith("#")){

           let id = text.slice(1)
            let copy =this.copy[id]


            if(copy){
                text=copy;
            }
        }

        mesh.setText(text, this.font);
        model.mesh = mesh

        model.material =  new FontMaterial(this.renderer, "fontMaterial");
        model.setMaterial("shadow", this.defaultFontShadowMaterial)

        let obj3D = new SceneObject3D(this.renderer, name)
        obj3D.addChild(model)
        obj3D.isText = true;
        obj3D.text = textData;
        obj3D.model = model;
        return obj3D;
    }
}
export default new ProjectData();
