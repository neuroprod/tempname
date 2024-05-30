
import Camera from "./Camera";
import Renderer from "./Renderer";
import {Matrix4, Vector2, Vector3, Vector4} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";
import Model from "./model/Model.ts";


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
    setFromCamera(camera: Camera, mousePosIn: Vector2) {

       // let mousePos = mousePosIn.clone().scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        //let pos = new Vector4(mousePos.x - 1, (mousePos.y - 1) * -1, 1, 1);

        //pos.transform(camera.viewProjectionInv as NumericArray);
        //this.rayStart = camera.cameraWorld.clone()
        //this.rayDir = new Vector3(pos.x - this.rayStart.x, pos.y - this.rayStart.y, pos.z - this.rayStart.z).normalize()

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
}