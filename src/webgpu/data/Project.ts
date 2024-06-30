import Renderer from "../lib/Renderer.ts";
import DefaultTextures from "../lib/textures/DefaultTextures.ts";
import Texture from "../lib/textures/Texture.ts";
import ProjectMesh from "./ProjectMesh.ts";
import DrawLine from "../modelMaker/drawing/DrawLine.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import TextureLoader from "../lib/textures/TextureLoader.ts";
import Utils from "../lib/UI/math/Utils.ts";
import MathUtils from "../lib/MathUtils.ts";

export default class Project
{
    public name: string ="";

    public meshes:Array<ProjectMesh>=[];

    drawLines: Array<DrawLine> = [];

    private renderer: Renderer;
    private isDirty: boolean =false;
    textureDirty: boolean =false;
    textureSize:number =1024;
    selectItems: Array<SelectItem> = [];

    baseTexture:Texture;
    fullTexture!: Texture;
    loadTexture!: TextureLoader;

    public isNew =true;
    id: string;
    constructor(renderer:Renderer)
    {
        this.renderer =renderer;
        this.baseTexture= DefaultTextures.getTransparent(renderer)

        this.id = MathUtils.generateUUID();
    }
    public setDirty(){
        this.isDirty = true;

    }

    getSaveString() {
        let a:any ={}
        a.version = "0.1";
        a.name = this.name;
        a.id =this.id;
        a.meshes =[]
        for(let d of this.meshes)
        {
            a.meshes.push(d.getMeshData())
        }
        return JSON.stringify(a)
    }

    setData(projData: any) {

        this.name =projData.name;
        if(projData.id){
            this.id =projData.id;
        }
        this.isNew =false;

        for (let m of projData.meshes){
            let pm= new ProjectMesh(this.renderer)
            pm.setData(m);
            this.selectItems.push(new SelectItem(pm.name,pm));
            this.meshes.push(pm)
        }




    }


    getProjectMeshByID(id: string) {
        for (let m of this.meshes){
            if(m.id ==id ){
                return m

            }

        }
        return null;
    }

    makeSelectItems() {
        this.selectItems=[]
        for (let m of this.meshes){
            this.selectItems.push(new SelectItem(m.name,m))
        }
    }
}
