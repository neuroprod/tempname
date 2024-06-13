import {Vector3} from "@math.gl/core";
import Curve from "./Curve.ts";

export default class Line extends Curve{
    private p1: Vector3;
    private p2: Vector3;

    constructor(p1:Vector3,p2:Vector3) {
        super();
        this.type=1;
        this.p1 =p1;
        this.p2 =p2;


    }
    public setMeshData(indices: Array<Number>, vertices: Array<Number>){

        let l=vertices.length/3
        indices.push(l)
        vertices.push(this.p1.x,this.p1.y,this.p1.z)
        indices.push(l+1)
    }


}
