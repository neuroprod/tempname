import {Vector3} from "@math.gl/core";
import Curve from "./Curve.ts";
import {NumericArray} from "@math.gl/types";

export default class Bezier extends Curve {
    p1: Vector3;
    p2: Vector3;
    c1: Vector3;
    c2: Vector3;
    private temp = new Vector3()

    constructor(p1: Vector3, c1: Vector3, p2: Vector3, c2: Vector3) {
        super();
        this.type = 2;
        this.p1 = p1;
        this.p2 = p2;
        this.c1 = c1;
        this.c2 = c2;

    }

    getP1(): Vector3 {
        return this.p1;
    }

    public setMeshDataControlPoints(indices: Array<Number>, positions: Array<Number>) {

        let l = positions.length / 3
        indices.push(l)
        positions.push(this.p1.x, this.p1.y, this.p1.z)
        indices.push(l + 1)
        positions.push(this.c1.x, this.c1.y, this.c1.z)


        indices.push(l + 2)
        positions.push(this.p2.x, this.p2.y, this.p2.z)
        indices.push(l + 3)
        positions.push(this.c2.x, this.c2.y, this.c2.z)

    }

    public setMeshData(indices: Array<Number>, positions: Array<Number>, divisions = 8) {

        let l = positions.length / 3
        indices.push(l++)
        positions.push(this.p1.x, this.p1.y, this.p1.z)//startPoint
        //indices.push(l++)

        let dist = this.p1.distance(this.p2)


        let numDivisions = divisions;
        if (dist < 0.05) {
            numDivisions *= 1 / (0.05 / dist);
            numDivisions = Math.round(numDivisions)
            numDivisions = Math.max(numDivisions, 2)
        }


        let step = 1 / numDivisions;
        for (let i = 1; i < numDivisions; i++) {
            indices.push(l)
            this.getTime(this.temp, i * step)
            positions.push(this.temp.x, this.temp.y, this.temp.z)//startPoint
            indices.push(l++)
        }
        indices.push(l)

    }

    public getTime(p: Vector3, t: number) {

        const inverseFactor = 1 - t;
        const inverseFactorTimesTwo = inverseFactor * inverseFactor;
        const factorTimes2 = t * t;

        const factor1 = inverseFactorTimesTwo * inverseFactor;
        const factor2 = 3 * t * inverseFactorTimesTwo;
        const factor3 = 3 * factorTimes2 * inverseFactor;
        const factor4 = factorTimes2 * t;

        p.x = this.p1.x * factor1 + this.c1.x * factor2 + this.c2.x * factor3 + this.p2.x * factor4;
        p.y = this.p1.y * factor1 + this.c1.y * factor2 + this.c2.y * factor3 + this.p2.y * factor4;
        p.z = this.p1.z * factor1 + this.c1.z * factor2 + this.c2.z * factor3 + this.p2.z * factor4;
        return p;
    }

    getDistanceToPoint(point: Vector3) {
        //TODO make it correct

        return (this.p1.distanceToSquared(point as NumericArray) + this.p2.distanceToSquared(point as NumericArray)) / 2

    }

}
