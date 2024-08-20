import {Vector2, Vector3} from "@math.gl/core";

import Line from "./Line.ts";
import Bezier from "./Bezier.ts";
import Curve from "./Curve.ts";
import {NumericArray} from "@math.gl/types";
import EndPoint from "./EndPoint.ts";


export default class Path {

    started: boolean = false;
    currentPoint: Vector3 = new Vector3()
    curves: Array<Curve> = [];

    constructor() {
    }

    get numCurves() {
        return this.curves.length
    }

    getNewPoint(p: Vector2 | Vector3 | NumericArray) {
        let vec = new Vector3()
        vec.from(p)
        if (vec.z == undefined) vec.z = 0;

        return vec;
    }


    moveTo(p: Vector2 | Vector3 | NumericArray) {
        this.started = true;
        if (this.curves.length > 0) {
            this.curves.push(new EndPoint(this.currentPoint))
        }
        this.currentPoint = this.getNewPoint(p);

    }

    end() {
        this.curves.push(new EndPoint(this.currentPoint))
    }

    lineTo(p: Vector2 | Vector3 | NumericArray) {

        let newPoint = this.getNewPoint(p);
        let line = new Line(this.currentPoint, newPoint)
        this.curves.push(line)
        this.currentPoint = newPoint;
    }


    bezierCurveTo(c1: Vector2 | Vector3 | NumericArray, c2: Vector2 | Vector3 | NumericArray, p: Vector2 | Vector3 | NumericArray) {
        let newPoint = this.getNewPoint(p);
        let c1n = this.getNewPoint(c1);
        let c2n = this.getNewPoint(c2);
        let bezier = new Bezier(this.currentPoint, c1n, newPoint, c2n);
        this.curves.push(bezier)
        this.currentPoint = newPoint;
    }

    public setMeshDataControlPoints(indices: Array<Number>, positions: Array<Number>){
        let numCurves = this.curves.length
        for (let i = 0; i < numCurves; i++) {
            if(this.curves[i].type==2){
                (this.curves[i] as Bezier).setMeshDataControlPoints(indices, positions)
            }


        }

    }
    public clear(){
        this.started =false;
        this.curves=[]
    }
    public setMeshData(indices: Array<Number>, positions: Array<Number>,divisions=8) {





        let numCurves = this.curves.length
        for (let i = 0; i < numCurves; i++) {
            this.curves[i].setMeshData(indices, positions,divisions)

        }
        //if no endpoint
        if (this.curves[numCurves - 1].type != 3) {
            positions.push(this.currentPoint.x, this.currentPoint.y, this.currentPoint.z);
        }

    }

    autoBezier(p: Vector2 | Vector3 | NumericArray) {
        let l = this.curves.length;

        //prev is also bezier
        if (l >= 1 && this.curves[l - 1].type == 2) {


            let prevBezier = this.curves[l - 1] as Bezier;
            let newPoint = this.getNewPoint(p);

            let dir1 = this.currentPoint.clone().subtract(prevBezier.p1 as NumericArray);
            let dir2 = newPoint.clone().subtract(this.currentPoint as NumericArray);
            let l1 = dir1.len()
            let l2 = dir2.len()

            dir1.scale(1 / l1)
            dir2.scale(1 / l2)

            dir1.add(dir2 as NumericArray);
            dir1.normalize()

            prevBezier.c2.from(dir1)
            prevBezier.c2.scale(-l1 / 3)
            prevBezier.c2.add(this.currentPoint as NumericArray);

            dir1.scale(l2 / 3)
            dir1.add(this.currentPoint as NumericArray)


            dir2.from(dir1)
            dir2.subtract(newPoint as NumericArray);
            dir2.scale(0.5);
            dir2.add(newPoint as NumericArray)


            let bezier = new Bezier(this.currentPoint, dir1, newPoint, dir2);
            this.curves.push(bezier);
            this.currentPoint = newPoint;


        } else {
            let newPoint = this.getNewPoint(p);

            //get dir
            let c1n = newPoint.clone().subtract(this.currentPoint as NumericArray);//dir
            let c2n = c1n.clone();

            //scaleDir
            c1n.scale(1 / 3);
            c2n.scale(2 / 3);

            c1n.add(this.currentPoint as NumericArray)
            c2n.add(this.currentPoint as NumericArray)
            let bezier = new Bezier(this.currentPoint, c1n, newPoint, c2n);
            this.curves.push(bezier);
            this.currentPoint = newPoint;

        }

    }


    serialize() {
        //TODO handel all cases
        let data:any = [];
        data.push(["m", this.curves[0].getP1()])
        for(let c of this.curves){
            if(c.type==1){
                data.push(["l", (c as Line).p2])
            }
            if(c.type==2){
                data.push(["b", (c as Bezier).c1, (c as Bezier).c2, (c as Bezier).p2])
            }

        }
        data.push(["cp", this.currentPoint])
        return data;
    }


    deSerialize(commands:Array<any>) {
        for(let c of commands){

            let com  =c[0]
            if(com=="m"){
                this.moveTo(c[1]);
            }else  if(com=="l"){
                this.lineTo(c[1]);
            }else  if(com=="b"){
                this.bezierCurveTo(c[1],c[2],c[3]);
            }else  if(com=="cp"){
                this.currentPoint.fromArray(c[1]);
            }
        }

    }

    getPoints(divisions=8) {
        let indices:Array<number>=[]
        let positions:Array<number>=[]
        this.setMeshData(indices, positions,divisions)

        let arr:Array<Vector2> =[]
        for(let i=0;i<positions.length;i+=3){
            let p =new Vector2(positions[i],positions[i+1])
            arr.push(p);
        }
        return arr;


    }

    removeLastCurve() {
        if(this.curves.length>1) {
            let lc = this.curves.pop();
            if(lc) this.currentPoint = lc.getP1();
        }
    }

    getDistance(pos: Vector3) {


        let minDistance =Number.MAX_VALUE
        for(let c of this.curves){
            let dist = c.getDistanceToPoint(pos)
            minDistance =Math.min(minDistance,dist);
        }
        return minDistance
    }
}

