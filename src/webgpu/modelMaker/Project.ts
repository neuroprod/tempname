import Renderer from "../lib/Renderer.ts";
import DefaultTextures from "../lib/textures/DefaultTextures.ts";
import Texture from "../lib/textures/Texture.ts";
import ProjectMesh from "./ProjectMesh.ts";
import DrawLine from "./drawing/DrawLine.ts";

export default class Project
{
    public name: string ="";

    public meshes:Array<ProjectMesh>=[];

    drawLines: Array<DrawLine> = [];
    public baseTexture:Texture;
    private renderer: Renderer;


    constructor(renderer:Renderer)
    {
        this.renderer =renderer;
        this.baseTexture= DefaultTextures.getWhite(renderer)


    }


    getSaveString() {
        let a:any ={}
        a.version = "0.1";
        a.name = this.name;
        a.meshes =[]
        for(let d of this.meshes)
        {
            a.meshes.push(d.getMeshData())
        }
        return JSON.stringify(a)
    }

    setData(projData: any) {
        console.log(projData)
        this.name =projData.name;
        this.baseTexture=projData.texture;
        for (let m of projData.meshes){
            let pm= new ProjectMesh(this.renderer)
            pm.setData(m);
            this.meshes.push(pm)
        }

    }
}
