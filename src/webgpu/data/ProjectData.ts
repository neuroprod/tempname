import PreLoader from "../lib/PreLoader.ts";
import Renderer from "../lib/Renderer.ts";

import Project from "./Project.ts";
import Model from "../lib/model/Model.ts";
import ProjectMesh, {MeshType} from "./ProjectMesh.ts";
import GBufferClipMaterial from "../render/GBuffer/GBufferClipMaterial.ts";
import ShadowClipDepthMaterial from "../render/shadow/ShadowClipDepthMaterial.ts";
import GBufferMaterial from "../render/GBuffer/GBufferMaterial.ts";
import SceneObject3D from "./SceneObject3D.ts";
import ShadowDepthMaterial from "../render/shadow/ShadowDepthMaterial.ts";

class ProjectData {
    private folders!: any;

    projects: Array<Project> = [];
    public projectsMap: Map<string, Project> = new Map<string, Project>();
    public projectsNameMap: Map<string, Project> = new Map<string, Project>();
    private renderer!: Renderer;
    private defaultShadowMaterial!: ShadowDepthMaterial;
    constructor() {
    }
   async init(renderer:Renderer,preloader:PreLoader,){
       this.defaultShadowMaterial = new ShadowDepthMaterial(renderer, "shadowDepth");

        this.renderer =renderer;
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
}
export default new ProjectData();
