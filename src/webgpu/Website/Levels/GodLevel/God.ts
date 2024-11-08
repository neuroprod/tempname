import SceneObject3D from "../../../data/SceneObject3D.ts";
import gsap from "gsap";
export default class God{
    private god: SceneObject3D;
    private tl!: gsap.core.Timeline;

    constructor(god: SceneObject3D) {
        this.god =god;
        this.god.y =5.3 +2

    }
    public show(onComplete:()=>void){
        this.tl =gsap.timeline()

        this.tl.to(this.god,{y:5.3,duration:4,ease:"power3.out"})


        this.tl.call(onComplete)
    }
    update(){

    }
}
