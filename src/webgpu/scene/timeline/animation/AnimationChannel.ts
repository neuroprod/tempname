import SceneObject3D from "../../SceneObject3D.ts";
import {AnimationType} from "./Animation.ts";
import {Quaternion, Vector3} from "@math.gl/core";


export class Key{
    frame:number =0;
    time:number =0;
    data:any

}
export default class AnimationChannel{

    public sceneObject3D:SceneObject3D

    public keys:Array<Key>=[]

    private type: AnimationType;
    private lastKeyIndex: number=0;

    constructor(sceneObject3D:SceneObject3D, type: AnimationType) {
        this.sceneObject3D =sceneObject3D;
        this.type =type;

    }
    getCurrentData(){
        if(this.type==AnimationType.TRANSLATE){
            let d =new Vector3()
            d.from(this.sceneObject3D.getPosition())
            return d;
        }
        else if(this.type==AnimationType.ROTATE){
            let q =new Quaternion()
            q.from(this.sceneObject3D.getRotation())
            return q;
        } else if(this.type==AnimationType.SCALE){
            let d =new Vector3()
            // @ts-ignore
            d.from(this.sceneObject3D.model.getScale())
            return d;
        }
    }



    addKey(frame: number,time:number) {
        for(let k of this.keys){
            if(k.frame==frame){
                k.time =time;
                k.data =this.getCurrentData();
                return;
            }
        }
        let key =new Key();
        key.frame =frame;
        key.time =time;
        key.data =this.getCurrentData();

        this.keys.push(key)
        this.lastKeyIndex =this.keys.length-1;
        this.sortKeys();

    }
    sortKeys(){
       this.keys.sort((a,b)=>{
           if(a.frame>b.frame){
               return 1
           }
           return -1
       })
    }

    setTime(time: number) {

        if(this.keys.length==0)return;
        if(this.keys.length==1){
            this.setCurrentData(this.keys[0].data)
            return;
        }
       if(time<=this.keys[0].time){
           this.setCurrentData(this.keys[0].data)
           return;
       }
        if(time>=this.keys[ this.lastKeyIndex].time){
            this.setCurrentData(this.keys[this.lastKeyIndex].data)
            return;
        }
        //interpolate


        for(let i =0;i< this.keys.length;i++){
            if(this.keys[i].time>time){
                let k0 =this.keys[i-1];
                let k1  =this.keys[i];
                let lerpVal =(time-k0.time)/ (k1.time -k0.time)
                if(this.type==AnimationType.TRANSLATE) {
                    let v = new Vector3()
                    v.from(k0.data)
                    v.lerp(k1.data, lerpVal)
                    this.sceneObject3D.setPositionV(v);
                }
                if(this.type==AnimationType.SCALE) {
                    let v = new Vector3()
                    v.from(k0.data)
                    v.lerp(k1.data, lerpVal)
                    this.sceneObject3D.model?.setScaleV(v);
                }
                if(this.type==AnimationType.ROTATE) {
                    let q = new Quaternion()
                    q.from(k0.data)
                    q.slerp(k1.data, lerpVal)
                    this.sceneObject3D.setRotationQ(q);
                }
               return;
            }
        }

    }
    setCurrentData(data:any){
        if(this.type==AnimationType.TRANSLATE){

            this.sceneObject3D.setPositionV(data);
        }
        else if(this.type==AnimationType.ROTATE){
            this.sceneObject3D.setRotationQ(data);
        } else if(this.type==AnimationType.SCALE){
            this.sceneObject3D.model?.setScaleV(data);
        }
    }
}
