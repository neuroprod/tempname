import {Vector3} from "@math.gl/core";
import Curve from "./Curve.ts";

export default class Bezier extends Curve{
    private p1: Vector3;
    private p2: Vector3;
    private c1: Vector3;
    private c2: Vector3;
    constructor(p1:Vector3,c1:Vector3,p2:Vector3,c2:Vector3) {
        super();
        this.type =2;
        this.p1 =p1;
        this.p2 =p2;
        this.c1 =c1;
        this.c2 =c2;

    }


}
