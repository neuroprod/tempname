import SceneObject3D from "../../../data/SceneObject3D.ts";
import gsap from "gsap";
export default class God{
    private god: SceneObject3D;
    private tl!: gsap.core.Timeline;
    private endX: number;

    constructor(god: SceneObject3D) {
        this.god =god;
        this.god.y =5.3 +4
        this.god.z =-2
        this.endX = god.x;
        this.god.rz=2
        god.x+=2;
    }
    public show(onComplete:()=>void){
        this.tl =gsap.timeline()

        this.tl.to(this.god,{rz:0,y:5.3,z:-0.2,x:this.endX,duration:2,ease:"power3.out"})


        this.tl.call(onComplete)
    }
    update(){

    }
}
