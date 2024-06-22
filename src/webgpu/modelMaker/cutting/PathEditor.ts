import Renderer from "../../lib/Renderer.ts";
import Path from "../../lib/path/Path.ts";
import Model from "../../lib/model/Model.ts";
import Quad from "../../lib/mesh/geometry/Quad.ts";
import PathPointMaterial from "./PathPointMaterial.ts";
import Bezier from "../../lib/path/Bezier.ts";
import {Vector2, Vector3} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";
import Curve from "../../lib/path/Curve.ts";
import Line from "../../lib/path/Line.ts";


class PathPoint {
    main!: Vector3;
    friends: Array<Vector3> = []
    type!: number = 0;//0 =mainPoint
    center!: Vector3;
    opposite!: Vector3;
    add(offset: Vector2,split:boolean =false) {
        let off = new Vector3(offset.x, offset.y, 0)
        this.main.add(off as NumericArray)
        if (this.type == 0) {
            for (let f of this.friends) {
                f.add(off as NumericArray)
            }
        }else {
            if(this.opposite && !split){

                let oppLength=this.center.distance(this.opposite as NumericArray);
                this.opposite.from(this.center);
                this.opposite.subtract(this.main as NumericArray);
                this.opposite.normalize();
                this.opposite.scale(oppLength);
                this.opposite.add(this.center as NumericArray);

            }


        }
    }
}

export default class PathEditor {
    pointModel: Model;
    private renderer: Renderer;
    private pathPoints: Array<PathPoint> = []

    private path: Path;
    private currentPathPoint: PathPoint | null = null;
    private currentMousePoint: Vector2 = new Vector2();
    private prevMousePoint: Vector2 = new Vector2();
    private splitBezier: boolean =false;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.pointModel = new Model(renderer, "pointModel")
        this.pointModel.visible = false
        this.pointModel.mesh = new Quad(renderer)
        this.pointModel.material = new PathPointMaterial(renderer, "PathPointMaterial");


    }

    setPath(path: Path, center: Vector2 | null) {

        if (!path.started) {
            this.pointModel.visible = false
            return;
        }
        this.path = path;

        // this.points = []
        let curves = path.curves;

        let pointDrawData = []
        for (let c of path.curves) {
            let p = c.getP1();
            // this.points.push(p)
            pointDrawData.push(p.x, p.y, p.z, 0)
            if (c.type == 2) {
                let c1 = (c as Bezier).c1
                // this.points.push(c1)
                pointDrawData.push(c1.x, c1.y, c1.z, 1)

                let c2 = (c as Bezier).c2
                // this.points.push(c2)
                pointDrawData.push(c2.x, c2.y, c2.z, 1)
            }

        }
        //   this.points.push(path.currentPoint)
        pointDrawData.push(path.currentPoint.x, path.currentPoint.y, path.currentPoint.z, 0)
        if (center) {
            pointDrawData.push(center.x, center.y, 0, 2)
        }
        this.pointModel.visible = true

        this.pointModel.createBuffer(new Float32Array(pointDrawData), "positionData")
        this.pointModel.numInstances = pointDrawData.length / 4;

    }

    getHitPoint(mouseLocal: Vector3) {

        let ps: PathPoint;
        let dist = Number.MAX_VALUE
        for (let p of this.pathPoints) {
            let ds = p.main.distanceSquared(mouseLocal as NumericArray)
            if (ds < dist) {
                dist = ds;
                ps = p;

            }
        }
        if (ps) {
            let psTest = ps.main.clone()
            let mstest = mouseLocal.clone()
            psTest.transform(this.pointModel.worldMatrix as NumericArray)
            mstest.transform(this.pointModel.worldMatrix as NumericArray)
            let screenDist = psTest.distance(mstest as NumericArray) / this.renderer.pixelRatio
            if (screenDist < 6) {
                return ps;
            }
        }
        return null

    }


    update() {
        this.pointModel.material.setUniform("scale", this.renderer.inverseSizePixelRatio)
    }


    moveAllPoints(vector3: Vector3) {

        console.log("moveAll");
        /*
        for (let p of this.points) {
            p.add(vector3 as NumericArray)
        }*/
    }

    createEditStruct() {

        this.pathPoints = [];
        for (let i = 0; i < this.path.curves.length; i++) {
            let curve = this.path.curves[i];
            let curvePrev: Curve | null = null;
            let curveNext: Curve | null = null;
            if (i > 0) {
                curvePrev = this.path.curves[i - 1];
            }
            if (i < this.path.curves.length + 1) {
                curveNext = this.path.curves[i + 1];
            }


            //mainPoints
            let pathPoint = new PathPoint()
            pathPoint.type = 0;
            this.pathPoints.push(pathPoint)
            let p = curve.getP1();
            pathPoint.main = p;
            if (curve.type == 2) {
                pathPoint.friends.push((curve as Bezier).c1)
            }
            if (curvePrev && curvePrev.type == 2) {
                pathPoint.friends.push((curvePrev as Bezier).c2)
            }

            //bezier controle points
            if (curve.type == 2) {
                let cb = curve as Bezier;
                let pathPointC1 = new PathPoint()
                pathPointC1.type = 1;
                pathPointC1.main = cb.c1;
                pathPointC1.center = cb.p1;

                if(curvePrev && curvePrev.type==2){
                    pathPointC1.opposite = (curvePrev as Bezier).c2
                }


                this.pathPoints.push(pathPointC1)


                let pathPointC2 = new PathPoint()
                pathPointC2.type = 1;
                pathPointC2.main = cb.c2;
                pathPointC2.center = cb.p2;
                if(curveNext && curveNext.type==2){
                    pathPointC2.opposite = (curveNext as Bezier).c1
                }
                this.pathPoints.push(pathPointC2)

            }

        }

        //last point
        let pathPoint = new PathPoint()
        pathPoint.type = 0;
        this.pathPoints.push(pathPoint)
        let  l= this.path.curves.length-1;
        let curve = this.path.curves[l];
        if(curve.type==1){
            pathPoint.main =(curve as Line).p2

        } if(curve.type==2){
            pathPoint.main =(curve as Bezier).p2
            pathPoint.friends.push((curve as Bezier).c2)
        }





    }

    onMouseDown(mousePos: Vector3,ctrlDown:boolean) {

        this.currentPathPoint = this.getHitPoint(mousePos);
        this.prevMousePoint.from(mousePos)
        this.splitBezier =ctrlDown;

    }

    onMouseMove(mousePos: Vector3, isUpThisFrame: boolean) {
        if (!this.currentPathPoint) return false;

        this.currentMousePoint.from(mousePos);
        this.currentMousePoint.subtract(this.prevMousePoint as NumericArray);

        if (this.currentMousePoint.lengthSquared() < 0) {
            if (isUpThisFrame) this.currentPathPoint = null
            return false;
        }//no move


        this.currentPathPoint.add(this.currentMousePoint,this.splitBezier);
        this.prevMousePoint.from(mousePos)

        if (isUpThisFrame) this.currentPathPoint = null
        return true;


    }
}
