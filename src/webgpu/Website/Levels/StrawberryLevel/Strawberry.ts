
import SceneHandler from "../../../data/SceneHandler.ts";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
class Tear{
    private tear: SceneObject3D;

    private startY: number;
    private tl: gsap.core.Timeline;
    constructor(tear:SceneObject3D) {
        this.tear =tear;
        this.startY =this.tear.posEditor.y
        this.tear.setScaler(0)
        this.tl =gsap.timeline({repeat:-1,delay:Math.random()*10})
        this.tl.to(this.tear,{sx:1,sy:1,sz:1,duration:1})
        this.tl.to(this.tear,{y:this.startY-0.05,duration:1,ease:"power2.inOut"})
        this.tl.to(this.tear,{y:this.startY-0.4,duration:0.5,ease:"power2.in"})
        this.tl.set(this.tear,{y:this.startY},Math.random()+3)
    }



    public destroy(){
        this.tl.clear()
    }
}
export default class Strawberry{

    tears:Array<Tear> =[]
    constructor() {
    }
    init(){
        this.tears =[]
        let th =SceneHandler.getSceneObject("tearHolder")

        for (let s of th.children){
            let t =new Tear(s as SceneObject3D)
            this.tears.push(t)
        }

    }
    update(){
        let delta =Timer.delta;

    }
    destroy(){
        for(let t of this.tears){
            t.destroy()
        }
        this.tears =[]
    }

}
