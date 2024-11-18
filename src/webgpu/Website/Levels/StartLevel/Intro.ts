import sceneHandler from "../../../data/SceneHandler.ts";


import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";



export default class Intro{
    private tl: any;

    public done =false;

    constructor() {
    }

    start(){
        if(this.tl)this.tl.clear()
        this.done =false;

    }

    update() {

    }
}
