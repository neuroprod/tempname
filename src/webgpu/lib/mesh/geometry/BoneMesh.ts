import Mesh from "../Mesh.ts";
import Renderer from "../../Renderer.ts";
import {Vector3} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";

export default class BoneMesh extends Mesh {

    constructor(renderer: Renderer, radius = 0.2, length = 0.6) {
        super(renderer, "bone");

        let vertices = new Array<number>();
        let normals = new Array<number>();
        let indices  = new Array<number>();
        let startIndex = 0

        let s = Math.cos(Math.PI / 4) * radius

        let vA = new Vector3()
        let vB = new Vector3()

        function addTriangle(v0: Vector3, v1: Vector3, v2: Vector3) {
            // calculateNormal
            vertices = vertices.concat(v0);
            vertices = vertices.concat(v1);
            vertices = vertices.concat(v2);

            vA.copy(v1 as NumericArray)
            vA.subtract(v0 as NumericArray)

            vB.copy(v2 as NumericArray)
            vB.subtract(v0 as NumericArray)

            let n = vA.cross(vB as NumericArray).normalize()

            normals = normals.concat(n);
            normals = normals.concat(n);
            normals = normals.concat(n);

            indices.push(startIndex, startIndex + 1, startIndex + 2);
            startIndex += 3;
        }

        addTriangle(new Vector3(0, 0, 0), new Vector3(radius, -s, s), new Vector3(radius, s, s));
        addTriangle(new Vector3(length, 0, 0), new Vector3(radius, s, s), new Vector3(radius, -s, s));

        addTriangle(new Vector3(0, 0, 0), new Vector3(radius, s, -s), new Vector3(radius, -s, -s));
        addTriangle(new Vector3(length, 0, 0), new Vector3(radius, -s, -s), new Vector3(radius, s, -s))

        addTriangle(new Vector3(0, 0, 0), new Vector3(radius, s, s), new Vector3(radius, s, -s))
        addTriangle(new Vector3(length, 0, 0), new Vector3(radius, s, -s), new Vector3(radius, s, s))

        addTriangle(new Vector3(0, 0, 0), new Vector3(radius, -s, -s), new Vector3(radius, -s, s))
        addTriangle(new Vector3(length, 0, 0), new Vector3(radius, -s, s), new Vector3(radius, -s, -s))


        this.setPositions(new Float32Array(vertices))
        this.setNormals(new Float32Array(normals))
        this.setIndices(new Uint16Array(indices))


    }


}
