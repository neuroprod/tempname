
import Camera from "./Camera";
import Renderer from "./Renderer";
import {Matrix4, Vector2, Vector3, Vector4} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";
import Model from "./model/Model.ts";
import Mesh from "./mesh/Mesh.ts";


export class RayIntersection{
    public model!:Model
    public distance:number=0
    public point:Vector3 =new Vector3(0,0,0)
}
export default class Ray {



    public rayStart: Vector3 = new Vector3();
    public rayDir: Vector3 = new Vector3();
    public maxLength=Number.MAX_VALUE
    private _rayStart: Vector3 = new Vector3();
    private _rayDir: Vector3 = new Vector3();
    private intersectionDistance: number=0;
private _temp: Vector3 = new Vector3();
    constructor() {


    }

    clone() {
        let r = new Ray()
        r.rayStart.from(this.rayStart);
        r.rayDir.from(this.rayDir);
        return r;
    }
    copy(r:Ray) {

        this.rayStart.from(r.rayStart);
        this.rayDir.from(r.rayDir);

    }
    setFromCameraData(camWorld:Vector3,camViewProjectionInv:Matrix4, mousePos: Vector2) {

        //let mousePos = mousePosIn.clone().scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        let pos = new Vector4(mousePos.x , mousePos.y , 1, 1);

        pos.transform(camViewProjectionInv as NumericArray);
        this.rayStart.from(camWorld)
        this.rayDir = new Vector3(pos.x - this.rayStart.x, pos.y - this.rayStart.y, pos.z - this.rayStart.z).normalize()

    }
    setFromCamera(camera: Camera, mousePos: Vector2) {

       //let mousePos = mousePosIn.clone().scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        let pos = new Vector4(mousePos.x , mousePos.y , 1, 1);

        pos.transform(camera.viewProjectionInv as NumericArray);
        this.rayStart.from(camera.cameraWorld)
        this.rayDir = new Vector3(pos.x - this.rayStart.x, pos.y - this.rayStart.y, pos.z - this.rayStart.z).normalize()

    }

    transform(invModel: Matrix4) {
        this._rayStart.from(this.rayStart);
        this._rayDir.from(this.rayDir);

        this._rayDir.add(this._rayStart as NumericArray);
        this._rayDir.transform(invModel as NumericArray);
        this._rayStart.transform(invModel as NumericArray);
        this._rayDir.subtract(this._rayStart as NumericArray);
    }
    intersectModel(model:Model)
    {

        this.transform(model.worldMatrixInv)
        if(this.intersectsBox(model.mesh.min,model.mesh.max)){


            this.intersectMesh(model.mesh);


            if(this.intersectionDistance>1000) return null

            let intersection =new RayIntersection()
            intersection.model =model;
            intersection.distance = this.intersectionDistance;
            intersection.point.from(this.rayDir);
            intersection.point.scale(this.intersectionDistance);
            intersection.point.add(this.rayStart as NumericArray);


            return intersection;
        }
        return null
    }

    intersectsBox(min: Vector3, max: Vector3) {

        const t1 = (min.x - this._rayStart.x) / this._rayDir.x;
        const t2 = (max.x - this._rayStart.x) / this._rayDir.x;
        const t3 = (min.y - this._rayStart.y) / this._rayDir.y;
        const t4 = (max.y - this._rayStart.y) / this._rayDir.y;
        const t5 = (min.z - this._rayStart.z) / this._rayDir.z;
        const t6 = (max.z - this._rayStart.z) / this._rayDir.z;

        const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
        const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

        if (tmax < 0) return false;
        if (tmin > tmax) return false;
        this.intersectionDistance = tmin;

        return true;
    }


    intersectModels(models: Array<Model>) {

        let intersections:Array<RayIntersection>=[]
        for(let m of models){
           let intersection =this.intersectModel(m);
           if(intersection){
               intersections.push(intersection)
           }
        }
        intersections.sort((a,b)=>{
            if(a.distance<b.distance){return -1}
            return 1;
        })
        return intersections;

    }

    intersectPlane(point: Vector3, normal: Vector3, invModel:Matrix4|null=null) {


        this._rayStart.from(this.rayStart as NumericArray);
        this._rayDir.from(this.rayDir as NumericArray);
        if( invModel) {
            this._rayDir.add(this._rayStart as NumericArray);
            this._rayDir.transform(invModel as NumericArray);
            this._rayStart.transform(invModel as NumericArray);
            this._rayDir.subtract(this._rayStart as NumericArray);
        }



        const d  = -normal.dot( this._rayDir as NumericArray )

        if ( d < 0.0001 && d > -0.0001) {
            return null;
        }
        const c =-point.dot(normal as NumericArray);
        const t = - ( this._rayStart.dot( normal as NumericArray ) + c ) / d;

        let p = this.rayDir.clone()
        p.scale(t)
        p.add(this.rayStart as NumericArray);
        return p
    }

    intersectSphere(position: Vector3, radius: number, invModel:Matrix4|null=null) {

        this._rayStart.from(this.rayStart);
        this._rayDir.from(this.rayDir);
        if( invModel) {
            this._rayDir.add(this._rayStart as NumericArray);
            this._rayDir.transform(invModel as NumericArray);
            this._rayStart.transform(invModel as NumericArray);
            this._rayDir.subtract(this._rayStart as NumericArray);
        }





        this._temp.from(this._rayStart)

        this._temp.subtract(position as NumericArray);
        const b = this._temp.dot( this._rayDir as NumericArray);
        const c = this._temp.dot(this._temp as NumericArray) - radius * radius;
        const h = b * b - c;
        if (h < 0.0) {
            return null;
        }

        const t = -b - Math.sqrt(h);
        if (t < 0) {
            return null;
        }

        let p = this.rayDir.clone()
        p.scale(t)
        p.add(this.rayStart as NumericArray);
        return p
    }

    p1 =new Vector3()
    p2 =new Vector3()
    p3 =new Vector3()
    edge1 =new Vector3()
    edge2 =new Vector3()
    normal =new Vector3()
    diff =new Vector3()
    private intersectMesh(mesh: Mesh) {
        this.intersectionDistance  = Number.MAX_VALUE;
        const a =this.p1;
        const b =this.p2;
        const c =this.p3;
        const edge1 =this.edge1;
        const edge2 =this.edge2;
        const normal =this.normal;
        const diff =this.diff;
        for(let i=0;i<mesh.numIndices;i+=3){

            let i1 = mesh.indices[i]*3;
            let i2 = mesh.indices[i+1]*3;
            let i3 = mesh.indices[i+2]*3;
            a.set(mesh.positions[i1],mesh.positions[i1+1],mesh.positions[i1+2]);
            b.set(mesh.positions[i2],mesh.positions[i2+1],mesh.positions[i2+2]);
            c.set(mesh.positions[i3],mesh.positions[i3+1],mesh.positions[i3+2]);

            edge1.subVectors( b as NumericArray, a as NumericArray );
            edge2.subVectors( c as NumericArray, a as NumericArray );
            normal.from(edge1 as NumericArray)
            normal.cross(edge2 as NumericArray)


            let DdN =  this._rayDir.dot( normal as NumericArray );
            let sign =-1;

            if ( DdN >= 0 ) {
               continue;
            }

            DdN = - DdN;

            diff.subVectors( this._rayStart as NumericArray, a as NumericArray);
            a.from(diff)
            const DdQxE2 = sign * this._rayDir.dot(a.cross(  edge2 as NumericArray )as NumericArray );

            // b1 < 0, no intersection
            if ( DdQxE2 < 0 ) {

                continue;

            }

            const DdE1xQ = sign * this._rayDir.dot( edge1.cross( diff as NumericArray ) as NumericArray );

            // b2 < 0, no intersection
            if ( DdE1xQ < 0 ) {

                continue;

            }

            // b1+b2 > 1, no intersection
            if ( DdQxE2 + DdE1xQ > DdN ) {

                continue;

            }

            // Line intersects triangle, check if ray does.
            const QdN = - sign * diff.dot( normal as NumericArray );

            // t < 0, no intersection
            if ( QdN < 0 ) {

                continue;

            }


            this.intersectionDistance  = Math.min( this.intersectionDistance ,QdN / DdN)
            // Ray intersects triangle.
           // return this.at( QdN / DdN, target );


        }


    }
}
