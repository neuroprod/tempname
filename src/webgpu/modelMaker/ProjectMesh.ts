import Renderer from "../lib/Renderer.ts";
import {Vector2} from "@math.gl/core";
import Path from "../lib/path/Path.ts";

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


    constructor(renderer:Renderer)
    {
        this.renderer =renderer;

    }
    getMeshData():any{
        let b:any ={}
        b.name = this.name;
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


    }

    setCenter(mouseLocal: Vector2) {
        this.center.from(mouseLocal);

    }
}
