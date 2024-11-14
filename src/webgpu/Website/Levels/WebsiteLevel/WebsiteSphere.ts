import Object3D from "../../../lib/model/Object3D.ts";
import {Matrix4, Quaternion, Vector3} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";
import Timer from "../../../lib/Timer.ts";


class SphereItem{

    private baseRotation:Quaternion
    private basePosition:Vector3
    private obj: Object3D;
    private dir :Vector3

    private sphereRotation:Quaternion =new Quaternion()
    private spherePosition:Vector3=new Vector3()

    private finalRotation:Quaternion =new Quaternion()
    private finalPosition:Vector3=new Vector3()

    private rotAxis = new Vector3()
    private rotAngle =0;
    constructor(obj :Object3D) {

        this.obj = obj;
        this.baseRotation =obj.getRotation().clone();
        this.basePosition=obj.getPosition().clone();

        let y = Math.random()*2-1     // random y coordinate
        let  r = Math.sqrt(1 - y*y)     // radius on xz plane at y
        let long = Math.random()*Math.PI*2 -Math.PI  // random longitude
        this.dir =new Vector3(r * Math.sin(long),y,r * Math.cos(long))
        this.dir.normalize();

this.rotAxis.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5)
        this.rotAxis.normalize();
    }


    public reset(){
        this.obj.setRotationQ(this.baseRotation)
        this.obj.setPositionV(this.basePosition)
    }


    update(blend: number, delta: number) {


        this.setSphereRotation();
        this.finalPosition.copy(this.spherePosition).lerp(this.basePosition,blend)
        this.finalRotation.copy(this.sphereRotation).slerp(this.baseRotation,blend)
        this.obj.setPositionV(this.finalPosition)
        this.obj.setRotationQ(this.finalRotation)

    }
    setSphereRotation(){



        let axis =new Vector3( 0,0,1)

        let dot = axis.dot(this.dir);
        let rotAngle = Math.acos(dot);


        let rotAxis =axis.clone()
        rotAxis.cross( this.dir);

        this.sphereRotation.fromAxisRotation(rotAxis,rotAngle)

        this.spherePosition.copy(this.dir).scale(0.7)
        this.spherePosition.z+=0.8
    }
}

export default class WebsiteSphere{


    private items:Array<SphereItem>=[]
    constructor() {
    }


    setObjects(children: Array<Object3D>) {

        this.items =[]
        for(let c of children){
            if(c.label!="background"){
            this.items.push(new SphereItem(c))}
        }
    }
    update(blend:number){
        let delta = Timer.delta;
        for(let i of  this.items){
            i.update(blend,delta)
        }
    }
    public destroy(){
        console.log("resetPos")
        for(let i of  this.items){
            i.reset()
        }
        this.items =[]
    }
}
