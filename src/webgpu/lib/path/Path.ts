import {Vector2, Vector3} from "@math.gl/core";

import Line from "./Line.ts";
import Bezier from "./Bezier.ts";
import Curve from "./Curve.ts";
import {NumericArray} from "@math.gl/types";
import EndPoint from "./EndPoint.ts";




export default class Path{

    private currentPoint:Vector3 =new Vector3()
    private curves:Array<Curve> = [];


    constructor() {
    }


    getNewPoint(p:Vector2|Vector3|NumericArray){
        let vec =new Vector3()
        vec.from(p)
        if(vec.z ==undefined) vec.z =0;
        vec.scale(0.01)
        vec.x+=0.5;
        vec.y+=0.5;
        return vec;
    }


    moveTo(p:Vector2|Vector3|NumericArray){
        if(this.curves.length>0){
            this.curves.push(new EndPoint(this.currentPoint))
        }
        this.currentPoint =this.getNewPoint(p);

    }
    end(){
        this.curves.push(new EndPoint(this.currentPoint))
    }

    lineTo(p:Vector2|Vector3|NumericArray){

        let newPoint =this.getNewPoint(p);
        let line  =new Line(this.currentPoint,newPoint)
        this.curves.push(line)
        this.currentPoint =newPoint;
    }


    bezierCurveTo(c1:Vector2|Vector3|NumericArray,c2:Vector2|Vector3|NumericArray,p:Vector2|Vector3|NumericArray){
        let newPoint =this.getNewPoint(p);
        let c1n =this.getNewPoint(c1);
        let c2n =this.getNewPoint(c2);
        let bezier = new Bezier(this.currentPoint,c1n,newPoint,c2n);
        this.curves.push(bezier)
    }




    public setMeshData(indices: Array<Number>, positions: Array<Number>) {
        let numCurves =this.curves.length
        for (let i=0;i<numCurves;i++){
            this.curves[i].setMeshData(indices,positions)

        }
    }
}

