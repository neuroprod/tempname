import Model from "../model/Model.ts";
import Renderer from "../Renderer.ts";
import Mesh from "../mesh/Mesh.ts";
import DebugLineMaterial from "./DebugLineMaterial.ts";
import {Matrix4, Vector3} from "@math.gl/core";
import ColorV from "../ColorV.ts";

export default class DebugLineModel extends Model{

    private positions:Array<number>=[];
    private colors:Array<number>=[];
    private indices:Array<number>=[];
    private indexCount:number =0;



    constructor(renderer: Renderer) {
        super(renderer,"DebugLineModel");
        this.mesh =new Mesh(this.renderer,"DebugLineMesh")
        this.material = new DebugLineMaterial(this.renderer,"DebugLineMaterial")
    }

    drawLine(point1:Vector3,point2:Vector3,color:ColorV,transform:Matrix4|null =null){
        this.positions =this.positions.concat(point1)
        this.positions =this.positions.concat(point2)
        this.colors = this.colors.concat(color)
        this.colors= this.colors.concat(color)
        this.indices.push(this.indexCount++,this.indexCount++)

    }
    update() {
       if(!this.positions.length) {
           this.visible =false;
           return;
       }

        this.mesh.setPositions(new Float32Array(this.positions))
        this.mesh.setColor0(new Float32Array(this.colors))
        this.mesh.setIndices(new Uint16Array(this.indices))
        super.update();
        this.positions=[]
        this.colors =[]
        this.indices=[]
        this.indexCount =0;
    }

}
