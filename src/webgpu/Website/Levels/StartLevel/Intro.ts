import sceneHandler from "../../../data/SceneHandler.ts";


import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";



export default class Intro{
    private tl: any;
    private star1!: SceneObject3D;
    private star2!: SceneObject3D;
    private star3!: SceneObject3D;
    public done =false;

    constructor() {
    }

    start(){
        if(this.tl)this.tl.clear()
        this.done =false;
        this.star1 =  sceneHandler.getSceneObject("star1")
        this.star2 =  sceneHandler.getSceneObject("star2")
        this.star3 =  sceneHandler.getSceneObject("star3")

        this.star1.setScaler(0)
        this.star2.setScaler(0)
        this.star3.setScaler(0)

        let portfolio = sceneHandler.getSceneObject("portfolio")
        portfolio.setScaler(0)

        let kris = sceneHandler.getSceneObject("Kris")
       kris.setScaler(0)
        let krisTarget = kris.y;
        kris.y+=0.2

        let someKind = sceneHandler.getSceneObject("someKind")
        someKind.setScaler(0)

        let rainbow = sceneHandler.getSceneObject("rainbow")
        rainbow.setScaler(0)

        let sun = sceneHandler.getSceneObject("sun")
        let sunTarget = sun.y;
        sun.y =sunTarget-0.45
        sun.setScaler(0)


        let click = sceneHandler.getSceneObject("click")
        let clickTarget = click.y;
        click.y =click.y-0.45
        click.setScaler(0.5)


        this.tl = gsap.timeline()
        let time =1
        this.tl.to(someKind,{sx:1,sy:1,sz:1,ease:"back.out(1.2)"},time)
        this.tl.to(portfolio,{sx:1,sy:1,sz:1,duration:0.7,ease:"back.out(1.1)"},time+0.4)
        time+=1.0
       // this.tl.to( kris,{sx:1,sy:1,sz:1,ease:"back.out(1.7)"},time)

        this.tl.to( sun,{sx:1,sy:1,sz:1,duration:0.5,ease:"power2.out"},time+0.5)
        this.tl.to( sun,{y:sunTarget,duration:1,ease:"power4.out"},time+0.5)

        this.tl.to( rainbow,{sx:1,sy:1,sz:1,duration:1.0,ease:"back.out(1.2)"},time)

        this.tl.to( kris,{sx:1,sy:1,sz:1,duration:0.2,ease:"power2.out"},time)
        this.tl.to( kris,{y:krisTarget,duration:1,ease:"power2.out"},time)

        time+=0.9
        this.tl.to(click,{sx:1,sy:1,sz:1,duration:0.2,ease:"power2.out"},time)
        this.tl.to(click,{y:clickTarget,duration:2,ease:"power2.out"},time)
        this.tl.set(this,{done:true},time)
        this.tl.to(this.star1,{sx:1,sy:1,sz:1,duration:0.8,ease:"power2.out"},time+2)
        this.tl.to(this.star2,{sx:1,sy:1,sz:1,duration:0.8,ease:"power2.out"},time+1)
        this.tl.to(this.star3,{sx:1,sy:1,sz:1,duration:0.8,ease:"power2.out"},time+3)


    }

    update() {
        this.star1.rz +=Timer.delta*0.5
        this.star2.rz -=Timer.delta*0.4
        this.star3.rz -=Timer.delta*0.45
    }
}
