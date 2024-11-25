import SceneObject3D from "../../../data/SceneObject3D.ts";
import gsap from "gsap";
import sceneHandler from "../../../data/SceneHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import Timer from "../../../lib/Timer.ts";


class Arm {

    rotPos=0
    private arm: SceneObject3D;
    private range: number;
    private speed: number;
    constructor(name:string, range:number,speed:number) {
        this.arm =SceneHandler.getSceneObject(name)
        this.range =range;
        this.speed =speed;

    }
    update(delta:number){
        this.rotPos+=delta*this.speed

        this.arm.rz =this.arm.rotEditor.z +Math.sin(this.rotPos)*this.range

    }
}

export default class God{
    private god!: SceneObject3D;
    private tl!: gsap.core.Timeline;
    private endX: number=0;
    private armTopLeft!: SceneObject3D;
private arms:Array<Arm>=[]

private cloudFloat =0
    private floating: boolean=false;
    private godHair!: SceneObject3D;
    constructor() {

    }
    init(god: SceneObject3D) {
        this.god =god;
        this.god.y =5.3 +4
        this.god.z =-2
        this.endX = god.x;
        this.god.rz=2
        god.x+=2;
        this.initArms()
       this.floating =false
        this.godHair = sceneHandler.getSceneObject("godHair")
    }
    initGame(){
        sceneHandler.getSceneObject("godLightning").hide()
        sceneHandler.getSceneObject("godNDA").hide()
        sceneHandler.getSceneObject("godCloud").hide()
        sceneHandler.getSceneObject("godPresent").hide()
        sceneHandler.getSceneObject("godLightning").hide()
        sceneHandler.getSceneObject("godHamer").hide()
        this.initArms()
        this.floating =false
    }

    initArms(){

        this.arms.push(new Arm("armTopLeftGod",0.2,0.3))
        this.arms.push(new Arm("armBottomLeftGod",0.2,0.4))
        this.arms.push(new Arm("armTopRightGod",0.2,0.35))
        this.arms.push(new Arm("armBottomRightGod",0.2,0.37))
    }
    public show(onComplete:()=>void){
        this.tl =gsap.timeline()

        this.tl.to(this.god,{rz:0,y:5.3,z:-0.2,x:this.endX,duration:2,ease:"power3.out"})

        this.tl.call(()=>{  this.cloudFloat =0;this.floating =true})
        this.tl.call(onComplete)
    }
    update(){
    let delta =Timer.delta;
        if( this.god &&  this.floating){
            this.cloudFloat -=delta*0.7
            this.god.y = 5.3+Math.sin(this.cloudFloat)*0.05

            this.godHair.y = this.godHair.posEditor.y  +Math.sin(-this.cloudFloat+0.5)*0.010
        }



        for(let a of this.arms){
            a.update(delta)

        }
    }
    destroy(){
    this.arms =[]
    }
}
