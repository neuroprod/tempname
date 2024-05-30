
import ShapeLineMaterial from "./ShapeLineMaterial.ts";
import {Matrix4, Vector2, Vector3} from "@math.gl/core";
import Model from "../../lib/model/Model.ts";
import Mesh from "../../lib/mesh/Mesh.ts";
import Renderer from "../../lib/Renderer.ts";


export default class ShapeLineModel extends Model{

    private positions:Array<number>=[];

    private indices:Array<number>=[];
    private indexCount:number =0;



    constructor(renderer: Renderer) {
        super(renderer,"ShapeLineModel");
        this.mesh =new Mesh(this.renderer,"ShapeLineMesh")
        this.material = new ShapeLineMaterial(this.renderer,"ShapeLineMaterial")
        this.material.depthWrite =false;

        this.visible =false;
    }

    setLine(points:Array<Vector2>,center:Vector2){

        if(points.length==0){
            this.visible =false;
            return;
        }
        this.visible =true;
        this.positions=[]
        let centerSize =0.01;
        this.positions.push(center.x-centerSize,center.y-centerSize,0)
        this.positions.push(center.x+centerSize,center.y+centerSize,0)
        this.positions.push(center.x-centerSize,center.y+centerSize,0)
        this.positions.push(center.x+centerSize,center.y-centerSize,0)



        for(let p of points){
            this.positions.push(p.x,p.y,0)

        }
        this.indices=[]

        this.indices.push(0,1)
        this.indices.push(2,3)
        for (let i=0;i<points.length-1;i++)
        {
            this.indices.push(i+4,i+1+4)
        }
       // this.indices.push(points.length-1,0)




        this.mesh.setPositions(new Float32Array(this.positions))
        this.mesh.setIndices(new Uint16Array(this.indices))
    }


}
