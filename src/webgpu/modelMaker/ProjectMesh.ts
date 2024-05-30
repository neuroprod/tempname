import Renderer from "../lib/Renderer.ts";
import {Vector2} from "@math.gl/core";

export default class ProjectMesh
{
    public name =""
    public points: Array<Vector2> = []
    center: Vector2 =new Vector2();
    private renderer: Renderer;


    constructor(renderer:Renderer)
    {
        this.renderer =renderer;

    }
    getMeshData():any{
        let b:any ={}
        b.name = this.name;
        b.center =this.center;
        b.points =[]
        for(let p of this.points){
            b.points.push(p.x,p.y);
        }
        return b;
    }

    updateCenter() {
        this.center.set(0,0)
        if(this.points.length==0)return;
        for(let p of this.points){
            this.center.add(p)
        }
        this.center.scale(1/this.points.length)

    }

    setData(m: any) {
        this.name =m.name
        this.center.set(m.center[0],m.center[1])
        for(let i=0;i<m.points.length;i+=2){
            this.points.push(new Vector2(m.points[i],m.points[i+1]));
        }

    }
}
