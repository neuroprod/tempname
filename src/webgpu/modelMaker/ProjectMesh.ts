import Renderer from "../lib/Renderer.ts";
import {Vector2} from "@math.gl/core";
import Path from "../lib/path/Path.ts";

export default class ProjectMesh
{
    public name =""
    public path =new Path()
    center: Vector2 =new Vector2(0.5,0.5);
    private renderer: Renderer;



    constructor(renderer:Renderer)
    {
        this.renderer =renderer;

    }
    getMeshData():any{
        let b:any ={}
        b.name = this.name;
        b.center =this.center;
        b.path =this.path.serialize()
     /*
        b.points =[]
        for(let p of this.points){
            b.points.push(p.x,p.y);
        }*/
        return b;
    }



    setData(m: any) {
        this.name =m.name
        this.center.set(m.center[0],m.center[1])
        this.path.deSerialize(m.path)
       //* for(let i=0;i<m.points.length;i+=2){
          //  this.points.push(new Vector2(m.points[i],m.points[i+1]));
        //}

    }

    setCenter(mouseLocal: Vector2) {
        this.center.from(mouseLocal);

    }
}
