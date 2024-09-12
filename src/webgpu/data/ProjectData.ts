import PreLoader from "../lib/PreLoader.ts";
import Renderer from "../lib/Renderer.ts";
import JsonLoader from "../lib/JsonLoader.ts";
import Project from "./Project.ts";

class ProjectData {
    private folders!: any;


    projects: Array<Project> = [];
    public projectsMap: Map<string, Project> = new Map<string, Project>();
    public projectsNameMap: Map<string, Project> = new Map<string, Project>();
    constructor() {
    }
   async init(renderer:Renderer,preloader:PreLoader,){

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
}
export default new ProjectData();
