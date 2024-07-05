import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import Camera from "../lib/Camera.ts";
import GameRenderer from "../render/GameRenderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import  gsap from "gsap";

import {Vector3} from "@math.gl/core";
import SceneData from "../data/SceneData.ts";
import Timer from "../lib/Timer.ts";
import sceneData from "../data/SceneData.ts";
import Animation from "../sceneEditor/timeline/animation/Animation.ts";
export default class Game{
    private renderer: Renderer;
    private mouseListener: MouseListener;
    private camera: Camera;
    private gameRenderer: GameRenderer;


    private camWorldStart =new Vector3(0.07257881533833874, 1.0, 5.51764249411784)
    private camWorldEnd =new Vector3(-0.22880370879692646, -0.07774185418921073, 1.2991582087187099)
  private camTargetStart=new Vector3(-0.12800455804343508, 0.5956693601780412, 0.10405709)
    private camTargetEnd =new Vector3(-0.21449705456233825, 0.09883339985250761, 0.009656110934113116)

    private camUpStart=new Vector3(1, 0, 0)
    private camUoEnd =new Vector3(0, 1, 0)


    private camWorld =new Vector3()
    private camTarget =new Vector3()
    private mofo: Animation;
    private bodyAnime: Animation;
    constructor(renderer: Renderer, mouseListener: MouseListener, camera:Camera,gameRenderer:GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera = camera
        this.gameRenderer = gameRenderer;

        console.log(sceneData.animationsByName)

        this.mofo =sceneData.animationsByName[ "mofoAnime"];
        this.bodyAnime =sceneData.animationsByName[ "bodyAnime"];


        this.camera.cameraWorld.set(-0.22880370879692646, -0.07774185418921073, 1.4991582087187099)
        this.camera.cameraLookAt.set(-0.21449705456233825, 0.09883339985250761, 0.009656110934113116)
        this.camera.cameraUp.set(0,1,0)
    }

    update() {
        this.camera.ratio = this.renderer.ratio





        this.camera.cameraWorld.copy(this.camWorld)
        this.camera.cameraLookAt.copy(this.camTarget)
        this.camera.update()

        SceneData.sceneModelsByName["cloud1"].x-=Timer.delta*0.07
        SceneData.sceneModelsByName["cloud2"].x-=Timer.delta*0.1
        SceneData.sceneModelsByName["cloud3"].x-=Timer.delta*0.11

        this.mofo.update(Timer.delta)
        this.bodyAnime.update(Timer.delta)
    }
    setActive() {
        this.mofo.play =false;
        this.mofo.setFrame(0);
        this.mofo.frameTime=1/60;
        this.bodyAnime.play =false;
        this.bodyAnime.setFrame(0);
        this.bodyAnime.frameTime=1/20;
        let tl = gsap.timeline({});
        tl.set(this.camWorld,{x:this.camWorldStart.x,y:this.camWorldStart.y,z:this.camWorldStart.z})
        tl.set(this.camTarget,{x:this.camTargetStart.x,y:this.camTargetStart.y,z:this.camTargetStart.z})
        tl.to(this.camWorld,{x:this.camWorldEnd.x,y:this.camWorldEnd.y,z:this.camWorldEnd.z,duration:12,ease:"power4.out"},1)
        tl.to(this.camTarget,{x:this.camTargetEnd.x,y:this.camTargetEnd.y,z:this.camTargetEnd.z,duration:12,ease:"power4.out"},1)

        tl.call(()=>{
            this.bodyAnime.play =true;
            console.log(this.bodyAnime)
        },[],3.5)


        tl.call(()=>{
            this.mofo.play =true;
        },[],4.5)

    }
    draw() {
        this.gameRenderer.draw();

        //SceneData.animations[0].autoPlay(Timer.delta)

    }

    drawInCanvas(pass: CanvasRenderPass) {

        this.gameRenderer.drawFinal(pass);

    }


}
