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
import KeyInput from "./KeyInput.ts";
import CharacterController from "./CharacterController.ts";
export default class Game{
    private renderer: Renderer;
    private mouseListener: MouseListener;
    private camera: Camera;
    private gameRenderer: GameRenderer;
    private keyInput: KeyInput;
    private characterController: CharacterController;




    constructor(renderer: Renderer, mouseListener: MouseListener, camera:Camera,gameRenderer:GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera = camera
        this.gameRenderer = gameRenderer;



        this.keyInput =new KeyInput()
        this.characterController = new CharacterController(renderer)
        this.setActive();

    }

    update() {
        this.camera.ratio = this.renderer.ratio
        this.camera.update()

        let delta  =Timer.delta;

        let jump =this.keyInput.getJump()
       let hInput = this.keyInput.getHdir()

        this.characterController.update(delta,hInput,jump)



    }
    setActive() {
        this.camera.cameraWorld.set(-0.22880370879692646, 1.57774185418921073, 4.4991582087187099)
        this.camera.cameraLookAt.set(-0.21449705456233825, 0.09883339985250761, 0.009656110934113116)
        this.camera.cameraUp.set(0,1,0)
    }
    draw() {
        this.gameRenderer.draw();

        //SceneData.animations[0].autoPlay(Timer.delta)

    }

    drawInCanvas(pass: CanvasRenderPass) {

        this.gameRenderer.drawFinal(pass);

    }


}
