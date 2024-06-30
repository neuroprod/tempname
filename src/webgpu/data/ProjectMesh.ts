import Renderer from "../lib/Renderer.ts";
import {Vector2, Vector3} from "@math.gl/core";
import Path from "../lib/path/Path.ts";
import ExtrudeMesh from "../modelMaker/ExtrudeMesh.ts";
import MathUtils from "../lib/MathUtils.ts";

export enum MeshType{
    EXTRUSION,
    PLANE,
    TRANS_PLANE,
    REVOLVE

}
export default class ProjectMesh
{
    public name =""
    public path =new Path()
    center: Vector2 =new Vector2(0.5,0.5);
    private renderer: Renderer;
    public meshType:MeshType =MeshType.EXTRUSION;
    private mesh!: ExtrudeMesh;
    id: string;


    constructor(renderer:Renderer)
    {
        this.renderer =renderer;
        this.id = MathUtils.generateUUID();
    }
    getMeshData():any{
        let b:any ={}
        b.name = this.name;
        b.id =this.id;
        b.center =this.center;
        b.path =this.path.serialize()
        b.meshType =this.meshType

        return b;
    }



    setData(m: any) {
        this.name =m.name
        this.center.set(m.center[0],m.center[1])
        this.path.deSerialize(m.path)
        if(m.meshType) {
            this.meshType =m.meshType

        }
        if(m.id) {
            this.id=m.id

        }


    }

    setCenter(mouseLocal: Vector2) {
        this.center.from(mouseLocal);

    }

    getMesh() {
        if(!this.mesh){
            this.mesh =new ExtrudeMesh(this.renderer,this.name);
            if(this.meshType == MeshType.REVOLVE){
                this.mesh.setResolve(this.path.getPoints(),new Vector3(this.center.x,this.center.y,0))
            }else{
                this.mesh.setExtrusion(this.path.getPoints(),this.meshType,0.01,new Vector3(this.center.x,this.center.y,0))
            }
        }
        return this.mesh;
    }
}
