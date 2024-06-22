import Renderer from "../../lib/Renderer.ts";
import Path from "../../lib/path/Path.ts";
import Model from "../../lib/model/Model.ts";
import Quad from "../../lib/mesh/geometry/Quad.ts";
import PathPointMaterial from "./PathPointMaterial.ts";
import Bezier from "../../lib/path/Bezier.ts";
import {Vector2, Vector3} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";

export default class PathEditor {
    pointModel: Model;
    private renderer: Renderer;

    private points: Array<Vector3> = []

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
        this.points = []
        let curves = path.curves;

        let pointDrawData = []
        for (let c of path.curves) {
            let p = c.getP1();
            this.points.push(p)
            pointDrawData.push(p.x, p.y, p.z, 0)
            if (c.type == 2) {
                let c1 = (c as Bezier).c1
                this.points.push(c1)
                pointDrawData.push(c1.x, c1.y, c1.z, 1)

                let c2 = (c as Bezier).c2
                this.points.push(c2)
                pointDrawData.push(c2.x, c2.y, c2.z, 1)
            }

        }
        this.points.push(path.currentPoint)
        pointDrawData.push(path.currentPoint.x, path.currentPoint.y, path.currentPoint.z, 0)
        if (center) {
            pointDrawData.push(center.x, center.y, 0, 0.5)
        }
        this.pointModel.visible = true

        this.pointModel.createBuffer( new Float32Array(pointDrawData),"positionData")
        this.pointModel.numInstances = pointDrawData.length / 4;

    }

    getHitPoint(mouseLocal: Vector3) {

        let ps: Vector3 =new Vector3();
        let dist = Number.MAX_VALUE
        for (let p of this.points) {
            let ds = p.distanceSquared(mouseLocal as NumericArray)
            if (ds < dist) {
                dist = ds;
                ps = p;

            }
        }
        if (ps) {
            let psTest = ps.clone()
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
        for (let p of this.points) {
            p.add(vector3 as NumericArray)
        }
    }
}
