import Curve from "./Curve.ts";
import {Vector2, Vector3} from "@math.gl/core";

export default class EndPoint extends Curve {
    private p: Vector3;
    constructor(endPoint: Vector3) {
        super();
        this.type =3;
        this.p =endPoint;
    }
    public setMeshData(indices: Array<Number>, positions: Array<Number>,divisions=8){
        positions.push(this.p.x,this.p.y,this.p.z);
    }
    getP1():Vector3{return this.p;}

}
