import Renderer from "../lib/Renderer.ts";
import DefaultTextures from "../lib/textures/DefaultTextures.ts";
import Texture from "../lib/textures/Texture.ts";
import ProjectMesh from "./ProjectMesh.ts";
import DrawLine from "../modelMaker/drawing/DrawLine.ts";

export default class Project
{
    public name: string ="";

    public meshes:Array<ProjectMesh>=[];

    drawLines: Array<DrawLine> = [];
    public baseTexture:Texture;
    private renderer: Renderer;
    private isDirty: boolean =false;
    textureDirty: boolean =false;
    textureSize:number =1024;

    constructor(renderer:Renderer)
    {
        this.renderer =renderer;
        this.baseTexture= DefaultTextures.getWhite(renderer)


    }
    public setDirty(){
        this.isDirty = true;

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

        this.name =projData.name;

        for (let m of projData.meshes){
            let pm= new ProjectMesh(this.renderer)
            pm.setData(m);
            this.meshes.push(pm)
        }

    }

    getMesh(name: string) {
        for (let m of this.meshes){
            if(m.name ==name ){
                return m.getMesh()

            }

        }
    }
}
