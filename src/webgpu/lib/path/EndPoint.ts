import Curve from "./Curve.ts";
import {Vector3} from "@math.gl/core";

export default class EndPoint extends Curve {
    private p: Vector3;
    constructor(endPoint: Vector3) {
        super();
        this.type =3;
        this.p =endPoint;
    }
    public setMeshData(indices: Array<Number>, vertices: Array<Number>){
        vertices.push(this.p.x,this.p.y,this.p.z);
    }
}
