import Mesh from "./Mesh.ts";
import {Vector2, Vector3} from "@math.gl/core";
import earcut from "earcut";

export default class ExtrudeMesh extends Mesh {

    private pos_temp: Array<number> = [];
    private norm_temp: Array<number> = [];
    private index_temp: Array<number> = [];
    private p1: Vector3 =new Vector3();
    private p2: Vector3 =new Vector3();
    private p3: Vector3 =new Vector3();
    private p4: Vector3 =new Vector3();

    setExtrusion(points: Array<Vector2>, thickness = 1, center = new Vector3()) {

        this.pos_temp = [];
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

            this.pos_temp.push(points[i].x - center.x)
            this.pos_temp.push(points[i].y - center.y);
            this.pos_temp.push(thick);
            this.norm_temp.push(0, 0, 1)


        }
        //back
      for (let i = 0; i < numBasePoints; i++) {


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

        let indexCount = this.pos_temp.length/3;

        for (let i = 0; i < numBasePoints-1; i++) {

            this.p1.set(points[i].x - center.x,points[i].y - center.y,thick);
            this.p2.set(points[i].x - center.x,points[i].y - center.y,negThick);
            this.p3.set(points[i+1].x - center.x,points[i+1].y - center.y,thick);
            this.p4.set(points[i+1].x - center.x,points[i+1].y - center.y,negThick);
            this.addQuad( indexCount);

            indexCount+=4;
        }
        //last quad
     let i =numBasePoints-1;
        this.p1.set(points[i].x - center.x,points[i].y - center.y,thick);
        this.p2.set(points[i].x - center.x,points[i].y - center.y,negThick);
        this.p3.set(points[0].x - center.x,points[0].y - center.y,thick);
        this.p4.set(points[0].x - center.x,points[0].y - center.y,negThick);
        this.addQuad( indexCount);


        this.setPositions(new Float32Array(this.pos_temp));
        this.setNormals(new Float32Array(this.norm_temp));
        this.setIndices(new Uint16Array(this.index_temp));


    }
    private addQuad( indexCount:number){

        this.pos_temp.push(this.p1.x,this.p1.y,this.p1.z);
        this.pos_temp.push(this.p2.x,this.p2.y,this.p2.z);
        this.pos_temp.push(this.p3.x,this.p3.y,this.p3.z);
        this.pos_temp.push(this.p4.x,this.p4.y,this.p4.z);

        this.p2.subtract(this.p1)
        this.p3.subtract(this.p1)

        this.p3.cross(this.p2)
        this.p3.normalize()
        this.norm_temp.push(this.p3.x, this.p3.y, this.p3.z);
        this.norm_temp.push(this.p3.x, this.p3.y, this.p3.z);
        this.norm_temp.push(this.p3.x, this.p3.y, this.p3.z);
        this.norm_temp.push(this.p3.x, this.p3.y, this.p3.z);

        this.index_temp.push(indexCount+1,indexCount, indexCount+2);
        this.index_temp.push(indexCount+1, indexCount+2, indexCount+3);
    }
}
