import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import Camera from "../lib/Camera.ts";
import GameRenderer from "../render/GameRenderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import  gsap from "gsap";

import {Vector3} from "@math.gl/core";
import SceneData from "../data/SceneData.ts";

export default class Game{
    private renderer: Renderer;
    private mouseListener: MouseListener;
    private camera: Camera;
    private gameRenderer: GameRenderer;


    private camWorldStart =new Vector3(0.07257881533833874, 1.545858542298912, 5.51764249411784)
    private camWorldEnd =new Vector3(-0.22880370879692646, -0.07774185418921073, 1.4991582087187099)
  private camTargetStart=new Vector3(-0.12800455804343508, 0.5956693601780412, 0.10405709)
    private camTargetEnd =new Vector3(-0.21449705456233825, 0.09883339985250761, 0.009656110934113116)

    private camWorld =new Vector3()
    private camTarget =new Vector3()
    constructor(renderer: Renderer, mouseListener: MouseListener, camera:Camera,gameRenderer:GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera = camera
        this.gameRenderer = gameRenderer;


    }

    update() {
        this.camera.ratio = this.renderer.ratio



        this.camera.cameraWorld.set(-0.22880370879692646, -0.07774185418921073, 1.4991582087187099)
        this.camera.cameraLookAt.set(-0.21449705456233825, 0.09883339985250761, 0.009656110934113116)
        this.camera.cameraUp.set(0,1,0)
    }
    setActive() {


        let tl = gsap.timeline({});
        tl.set(this.camWorld,{x:this.camWorldStart.x,y:this.camWorldStart.y,z:this.camWorldStart.z})
        tl.set(this.camTarget,{x:this.camTargetStart.x,y:this.camTargetStart.y,z:this.camTargetStart.z})
        tl.to(this.camWorld,{x:this.camWorldEnd.x,y:this.camWorldEnd.y,z:this.camWorldEnd.z,duration:2,ease:"power3.out"},1)
        tl.to(this.camTarget,{x:this.camTargetEnd.x,y:this.camTargetEnd.y,z:this.camTargetEnd.z,duration:2,ease:"power3.out"},1)


    }
    draw() {
        this.gameRenderer.draw();
        this.camera.cameraWorld.copy(this.camWorld)
        this.camera.cameraLookAt.copy(this.camTarget)
        this.camera.update()
        //SceneData.animations[0].autoPlay(Timer.delta)

    }

    drawInCanvas(pass: CanvasRenderPass) {

        this.gameRenderer.drawFinal(pass);

    }


}
