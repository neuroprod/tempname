import {Vector2, Vector3} from "@math.gl/core";
import Curve from "./Curve.ts";
import {NumericArray} from "@math.gl/types";

export default class Line extends Curve{
    private p1: Vector3;
    public p2: Vector3;

    constructor(p1:Vector3,p2:Vector3) {
        super();
        this.type=1;
        this.p1 =p1;
        this.p2 =p2;


    }
    getP1():Vector3{return this.p1;}
    public setMeshData(indices: Array<Number>, positions: Array<Number>,divisions=8){

        let l=positions.length/3
        indices.push(l)
        positions.push(this.p1.x,this.p1.y,this.p1.z)
        indices.push(l+1)
    }

    //TODO make it correct
    getDistanceToPoint(point: Vector3) {
      return  (this.p1.distanceToSquared(point as NumericArray)+this.p2.distanceToSquared(point as NumericArray))/2
    }
}
