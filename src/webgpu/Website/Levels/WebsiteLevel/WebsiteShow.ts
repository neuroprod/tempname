import Object3D from "../../../lib/model/Object3D.ts";
import {Matrix4, Quaternion, Vector3} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
import SoundHandler from "../../SoundHandler.ts";

class ShowItem{


     baseScale:Vector3
    obj: Object3D;
    posY: number;
    posZ: number;

    constructor(obj :Object3D) {

        this.obj = obj;
        this.posY =obj.y;
        this.posZ =obj.z;
        this.baseScale=obj.getScale().clone();
        obj.setScaler(0)
        obj.z =-0.3
    }


    public reset(){

        this.obj.setScaleV(this.baseScale)
    }


}

export default class WebsiteShow {


    private items:Array<ShowItem>=[]
    private head!: Object3D;
    private mofo!: Object3D;
    constructor() {
    }


    setObjects(children: Array<Object3D>) {

        this.items =[]
        for(let c of children){
            if(c.label!="background" &&      c.label!="headKris" && c.label!="mofo"){
            this.items.push(new ShowItem(c))}

            if(c.label=="headKris"){
                this.head = c;
            }
            if(c.label=="mofo"){
                this.mofo= c;
            }
        }


    }

    public destroy(){

        for(let i of  this.items){
            i.reset()
        }
        this.items =[]
    }

    show() {
        this.items.sort((a,b)=>{
            if(a.posY>b.posY)return-1
            return 1;
        })
       let y = this.head.y
        this.head.y =0.5;
        this.mofo.setScaler(0)
        let tl =gsap.timeline()
        tl.to(this.head,{y:y,duration:1,ease:"elastic.out(0.5,0.3)"})
        tl.to( this.mofo,{sx:1,sy:1,sz:1, duration:0.5,ease:"back.out"})

        let time =2;
        for(let t of this.items){
            tl.to(t.obj,{z:t.posZ,sx:t.baseScale.x,sy:t.baseScale.y,sz:t.baseScale.z,duration:0.5,ease:"back.out",onStart:()=>{
                //SoundHandler.playStep()

                }},time)
            time+=0.1;
        }



    }
}
