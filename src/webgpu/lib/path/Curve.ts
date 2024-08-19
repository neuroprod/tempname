//base class

import {Vector2, Vector3} from "@math.gl/core";

export default class Curve{

    type=-1;
    public setMeshData(indices: Array<Number>, positions: Array<Number>,divisions=8){

    }
     getP1():Vector3{return new Vector3()}


    getDistanceToPoint(point: Vector3) {
        return Number.MAX_VALUE
    }
}
