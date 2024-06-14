import {Vector2, Vector3} from "@math.gl/core";

import Line from "./Line.ts";
import Bezier from "./Bezier.ts";
import Curve from "./Curve.ts";
import {NumericArray} from "@math.gl/types";
import EndPoint from "./EndPoint.ts";


export default class Path {

    started: boolean = false;
    private currentPoint: Vector3 = new Vector3()
    private curves: Array<Curve> = [];

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


    public setMeshData(indices: Array<Number>, positions: Array<Number>) {
        let numCurves = this.curves.length
        for (let i = 0; i < numCurves; i++) {
            this.curves[i].setMeshData(indices, positions)

        }
        //if no endpoint
        if (this.curves[numCurves - 1].type != 3) {
            positions.push(this.currentPoint.x, this.currentPoint.y, this.currentPoint.z);
        }

        console.log(indices, positions)
    }

    autoBezier(p: Vector2 | Vector3 | NumericArray) {
        let l = this.curves.length;
console.log("autobezier")
        //prev is also bezier
        if (l >= 1 && this.curves[l - 1].type == 2) {
console.log("bezier to bezier")

            let prevBezier = this.curves[l - 1] as Bezier;
            let newPoint = this.getNewPoint(p);

            let dir1 =this.currentPoint.clone().subtract( prevBezier.p1 as NumericArray);
            let dir2 =newPoint.clone().subtract(this.currentPoint as NumericArray);
            let l1 =dir1.len()
            let l2 =dir2.len()

            dir1.scale(1/l1)
            dir2.scale(1/l2)

            dir1.add(dir2 as NumericArray);
            dir1.normalize()

            prevBezier.c2.from(dir1)
            prevBezier.c2.scale(-l1/2)
            prevBezier.c2.add(this.currentPoint as NumericArray);

            dir1.scale(l2/2)
            dir1.add(this.currentPoint as NumericArray)


            dir2.from(newPoint)
            dir2.subtract(this.currentPoint as NumericArray);
            dir2.scale(2 / 3);
            dir2.add(this.currentPoint as NumericArray)
           // let c1n =new Vector3()
           // let c2n =new Vector3()






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
}

