import PreLoader from "../lib/PreLoader.ts";
import Renderer from "../lib/Renderer.ts";

import Project from "./Project.ts";
import Model from "../lib/model/Model.ts";
import ProjectMesh, {MeshType} from "./ProjectMesh.ts";

import SceneObject3D from "./SceneObject3D.ts";
import ShadowDepthMaterial from "../render/shadow/ShadowDepthMaterial.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import FontMesh from "../modelMaker/FontMesh.ts";
import GBufferFontMaterial from "../render/GBuffer/GBufferFontMaterial.ts";
import ShadowFontDepthMaterial from "../render/shadow/ShadowFontDepthMaterial.ts";
import Font from "./Font.ts";

class ProjectData {
    private folders!: any;

    projects: Array<Project> = [];
    public projectsMap: Map<string, Project> = new Map<string, Project>();
    public projectsNameMap: Map<string, Project> = new Map<string, Project>();
    private renderer!: Renderer;
    private defaultShadowMaterial!: ShadowDepthMaterial;
    projectSelectItems: Array<SelectItem> = [];
    private defaultFontMaterial!: GBufferFontMaterial;
    private defaultFontShadowMaterial!: ShadowFontDepthMaterial;
    font!: Font;
    constructor() {
    }
   async init(renderer:Renderer,preloader:PreLoader,){

       this.renderer =renderer;

       this.defaultShadowMaterial = new ShadowDepthMaterial(renderer, "shadowDepth");
       this.defaultFontMaterial = new GBufferFontMaterial(renderer, "fontMaterial");
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
        let mesh = new FontMesh(this.renderer, 'fontMesh');
        mesh.setText(text, this.font);
        model.mesh = mesh

        model.material = this.defaultFontMaterial;
        model.setMaterial("shadow", this.defaultFontShadowMaterial)

        let obj3D = new SceneObject3D(this.renderer, name)
        obj3D.addChild(model)
        obj3D.isText = true;
        obj3D.text = text;
        obj3D.model = model;
        return obj3D;
    }
}
export default new ProjectData();
