import Mesh from "./Mesh.ts";
import {Vector2, Vector3} from "@math.gl/core";
import earcut from "earcut";

export default class ExtrudeMesh extends Mesh {
    private uv_temp: Array<number> = [];
    private pos_temp: Array<number> = [];
    private norm_temp: Array<number> = [];
    private index_temp: Array<number> = [];
    private p1: Vector3 =new Vector3();
    private p2: Vector3 =new Vector3();
    private p3: Vector3 =new Vector3();
    private p4: Vector3 =new Vector3();

    setExtrusion(points: Array<Vector2>, thickness = 1, center = new Vector3()) {

        let edgeSum =0
        for (let i = 0; i < points.length-1; i++) {

            let p1 =points[i]
            let p2 =points[i+1]
            edgeSum+=(p2.x-p1.x)*(p2.y+p1.y)

        }
        if(edgeSum<0)points.reverse()





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

           this.uv_temp.push(points[i].x ,1-points[i].y);
            this.pos_temp.push(points[i].x - center.x);
            this.pos_temp.push(points[i].y - center.y);
            this.pos_temp.push(thick);
            this.norm_temp.push(0, 0, 1)


        }
        //back
      for (let i = 0; i < numBasePoints; i++) {

          this.uv_temp.push(points[i].x ,1-points[i].y);
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

            this.p1.set(points[i].x ,points[i].y ,thick);
            this.p2.set(points[i].x ,points[i].y ,negThick);
            this.p3.set(points[i+1].x ,points[i+1].y ,thick);
            this.p4.set(points[i+1].x ,points[i+1].y ,negThick);
            this.addQuad( indexCount,center);

            indexCount+=4;
        }
        //last quad
        let i =numBasePoints-1;
        this.p1.set(points[i].x ,points[i].y ,thick);
        this.p2.set(points[i].x ,points[i].y,negThick);
        this.p3.set(points[0].x,points[0].y ,thick);
        this.p4.set(points[0].x ,points[0].y ,negThick);
        this.addQuad( indexCount,center);


        this.setPositions(new Float32Array(this.pos_temp));
        this.setNormals(new Float32Array(this.norm_temp));
        this.setUV0(new Float32Array(this.uv_temp));
        this.setIndices(new Uint16Array(this.index_temp));


        this.pos_temp =[];
        this.norm_temp =[];
        this.uv_temp =[];
        this.index_temp =[];

    }
    private addQuad( indexCount:number,center:Vector3){

        this.uv_temp.push(this.p1.x,1-this.p1.y);
        this.uv_temp.push(this.p2.x,1-this.p2.y);
        this.uv_temp.push(this.p3.x,1-this.p3.y);
        this.uv_temp.push(this.p3.x,1-this.p3.y);

        this.pos_temp.push(this.p1.x- center.x,this.p1.y- center.y,this.p1.z);
        this.pos_temp.push(this.p2.x- center.x,this.p2.y- center.y,this.p2.z);
        this.pos_temp.push(this.p3.x- center.x,this.p3.y- center.y,this.p3.z);
        this.pos_temp.push(this.p4.x- center.x,this.p4.y- center.y,this.p4.z);

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
