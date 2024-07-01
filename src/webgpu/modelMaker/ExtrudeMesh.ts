import Mesh from "../lib/mesh/Mesh.ts";
import {Vector2, Vector3} from "@math.gl/core";
import earcut from "earcut";
import {NumericArray} from "@math.gl/types";
import {MeshType} from "../data/ProjectMesh.ts";


export default class ExtrudeMesh extends Mesh {
    private uv_temp: Array<number> = [];
    private pos_temp: Array<number> = [];
    private norm_temp: Array<number> = [];
    private index_temp: Array<number> = [];
    private p1: Vector3 = new Vector3();
    private p2: Vector3 = new Vector3();
    private p3: Vector3 = new Vector3();
    private p4: Vector3 = new Vector3();
    private n1: Vector3 = new Vector3();
    private n2: Vector3 = new Vector3();


    setResolve(points: Array<Vector2> ,center = new Vector3()){



        for (let i = 0; i < points.length ; i++) {

             points[i].x = points[i].x -center.x;
            points[i].y =points[i].y -center.y;

        }




        //stolen from Threejs

        let segments =20;

        const indices = [];
        const vertices = [];
        const uvs = [];
        const initNormals = [];
        const normals = [];

        const inverseSegments = 1.0 / segments;
        const vertex = new Vector3();
        const uv = new Vector2();
        const normal = new Vector3();
        const curNormal = new Vector3();
        const prevNormal = new Vector3();
        let dx = 0;
        let dy = 0;

        // pre-compute normals for initial "meridian"

        for ( let j = 0; j <= ( points.length - 1 ); j ++ ) {

            switch ( j ) {

                case 0:				// special handling for 1st vertex on path

                    dx = points[ j + 1 ].x - points[ j ].x;
                    dy = points[ j + 1 ].y - points[ j ].y;

                    normal.x = dy * 1.0;
                    normal.y = - dx;
                    normal.z = dy * 0.0;

                    prevNormal.copy( normal as NumericArray);

                    normal.normalize();

                    initNormals.push( normal.x, normal.y, normal.z );

                    break;

                case ( points.length - 1 ):	// special handling for last Vertex on path

                    initNormals.push( prevNormal.x, prevNormal.y, prevNormal.z );

                    break;

                default:			// default handling for all vertices in between

                    dx = points[ j + 1 ].x - points[ j ].x;
                    dy = points[ j + 1 ].y - points[ j ].y;

                    normal.x = dy * 1.0;
                    normal.y = - dx;
                    normal.z = dy * 0.0;

                    curNormal.copy( normal as NumericArray );

                    normal.x += prevNormal.x;
                    normal.y += prevNormal.y;
                    normal.z += prevNormal.z;

                    normal.normalize();

                    initNormals.push( normal.x, normal.y, normal.z );

                    prevNormal.copy( curNormal  as NumericArray);

            }

        }

        // generate vertices, uvs and normals

        for ( let i = 0; i <= segments; i ++ ) {

            const phi =  i * inverseSegments *Math.PI*2;

            const sin = Math.sin( phi );
            const cos = Math.cos( phi );

            for ( let j = 0; j <= ( points.length - 1 ); j ++ ) {

                // vertex

                vertex.x = points[ j ].x * sin;
                vertex.y = points[ j ].y ;
                vertex.z = points[ j ].x * cos;

                vertices.push( vertex.x, vertex.y, vertex.z );

                // uv

                uv.x =(points[ j ].x +center.x);
                uv.y = 1-(points[ j ].y+center.y);

                uvs.push( uv.x, uv.y );

                // normal

                const x = initNormals[ 3 * j + 0 ] * sin;
                const y = initNormals[ 3 * j + 1 ];
                const z = initNormals[ 3 * j + 0 ] * cos;

                normals.push( x, y, z );

            }

        }

        // indices

        for ( let i = 0; i < segments; i ++ ) {

            for ( let j = 0; j < ( points.length - 1 ); j ++ ) {

                const base = j + i * points.length;

                const a = base;
                const b = base + points.length;
                const c = base + points.length + 1;
                const d = base + 1;

                // faces

                indices.push( a, b, d );
                indices.push( c, d, b );

            }

        }
        this.setPositions(new Float32Array(vertices));
        this.setNormals(new Float32Array(normals));
        this.setUV0(new Float32Array(uvs));
        this.setIndices(new Uint16Array (indices));
    }


    setExtrusion(points: Array<Vector2>,type:MeshType, thickness = 1, center = new Vector3()) {

        let edgeSum = 0
        for (let i = 0; i < points.length - 1; i++) {

            let p1 = points[i]
            let p2 = points[i + 1]
            edgeSum += (p2.x - p1.x) * (p2.y + p1.y)

        }
        let p1 = points[points.length - 1]
        let p2 = points[0]
        edgeSum += (p2.x - p1.x) * (p2.y + p1.y)

        if (edgeSum < 0) points.reverse()

        if(type==MeshType.REVOLVE){


            return;
        }



        let numPoints =points.length

        let normals:Array<Vector2>=[]

        let N1 =new Vector2()
        let N2 =new Vector2()
        for(let i=0;i<numPoints;i++){

            let iN =(i+numPoints-1)%numPoints
            let iP=(i+1)%numPoints;
            let pN =points[iN];
            let p =points[i];
            let pP =points[iP];

            N1.from(pN)
            N1.subtract(p as NumericArray)

            N2.from(p)
            N2.subtract(pP as NumericArray)

            //N1.normalize()
            //N2.normalize()

            N1.add(N2 as NumericArray)
            let N =new Vector2(N1.y,-N1.x)
            N.normalize()
            normals.push(N)

        }







        this.pos_temp = [];
        this.uv_temp = [];
        this.index_temp = [];
        this.norm_temp = [];
        let pArr = [];
        for (let p of points) {
            pArr.push(p.x, p.y)

        }
        let triangles = earcut(pArr);
        this.index_temp = this.index_temp.concat(triangles);


        let numBaseIndices = triangles.length
        let numBasePoints = points.length
        let thick = thickness / 2
        let negThick = -thickness / 2
        //front
        for (let i = 0; i < numBasePoints; i++) {

            this.uv_temp.push(points[i].x, 1 - points[i].y);
            this.pos_temp.push(points[i].x - center.x);
            this.pos_temp.push(points[i].y - center.y);
            this.pos_temp.push(thick);
            this.norm_temp.push(0, 0, 1)


        }
        if(type==MeshType.EXTRUSION) {
            //back
            for (let i = 0; i < numBasePoints; i++) {

                this.uv_temp.push(points[i].x, 1 - points[i].y);
                this.pos_temp.push(points[i].x - center.x)
                this.pos_temp.push(points[i].y - center.y);
                this.pos_temp.push(negThick);

                this.norm_temp.push(0, 0, -1)

            }
            //back indices
            for (let i = 0; i < numBaseIndices; i += 3) {
                let i1 = triangles[i] + numBasePoints;
                let i2 = triangles[i + 1] + numBasePoints;
                let i3 = triangles[i + 2] + numBasePoints;
                this.index_temp.push(i2, i1, i3);
            }

            let indexCount = this.pos_temp.length / 3;

            for (let i = 0; i < numBasePoints - 1; i++) {

                this.p1.set(points[i].x, points[i].y, thick);
                this.p2.set(points[i].x, points[i].y, negThick);
                this.p3.set(points[i + 1].x, points[i + 1].y, thick);
                this.p4.set(points[i + 1].x, points[i + 1].y, negThick);
                this.n1.set(normals[i].x, normals[i].y, 0)
                this.n2.set(normals[i + 1].x, normals[i + 1].y, 0)
                this.addQuad(indexCount, center);

                indexCount += 4;
            }
            //last quad
            let i = numBasePoints - 1;
            this.p1.set(points[i].x, points[i].y, thick);
            this.p2.set(points[i].x, points[i].y, negThick);
            this.p3.set(points[0].x, points[0].y, thick);
            this.p4.set(points[0].x, points[0].y, negThick);
            this.n1.set(normals[i].x, normals[i].y, 0);
            this.n2.set(normals[0].x, normals[0].y, 0);
            this.addQuad(indexCount, center);

        }
        this.setPositions(new Float32Array(this.pos_temp));
        this.setNormals(new Float32Array(this.norm_temp));
        this.setUV0(new Float32Array(this.uv_temp));
        this.setIndices(new Uint16Array(this.index_temp));


        this.pos_temp = [];
        this.norm_temp = [];
        this.uv_temp = [];
        this.index_temp = [];

    }

    private addQuad(indexCount: number, center: Vector3) {

        this.uv_temp.push(this.p1.x, 1 - this.p1.y);
        this.uv_temp.push(this.p2.x, 1 - this.p2.y);
        this.uv_temp.push(this.p3.x, 1 - this.p3.y);
        this.uv_temp.push(this.p3.x, 1 - this.p3.y);

        this.pos_temp.push(this.p1.x - center.x, this.p1.y - center.y, this.p1.z);
        this.pos_temp.push(this.p2.x - center.x, this.p2.y - center.y, this.p2.z);
        this.pos_temp.push(this.p3.x - center.x, this.p3.y - center.y, this.p3.z);
        this.pos_temp.push(this.p4.x - center.x, this.p4.y - center.y, this.p4.z);

       // this.p2.subtract(this.p1)
        //this.p3.subtract(this.p1)

        //this.p3.cross(this.p2)
        //this.p3.normalize()
        this.norm_temp.push(this.n1.x, this.n1.y, this.n1.z);
        this.norm_temp.push(this.n1.x, this.n1.y, this.n1.z);
        this.norm_temp.push(this.n2.x, this.n2.y, this.n2.z);
        this.norm_temp.push(this.n2.x, this.n2.y, this.n2.z);

        this.index_temp.push(indexCount + 1, indexCount, indexCount + 2);
        this.index_temp.push(indexCount + 1, indexCount + 2, indexCount + 3);
    }
}
