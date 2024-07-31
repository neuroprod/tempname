import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import Camera from "../lib/Camera.ts";
import GameRenderer from "../render/GameRenderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";

import Timer from "../lib/Timer.ts";

import KeyInput from "./KeyInput.ts";
import CharacterController from "./CharacterController.ts";
import GameCamera from "./GameCamera.ts";
import DebugDraw from "./DebugDraw.ts";
import CloudParticles from "./CloudParticles.ts";
import GamePadInput from "./GamePadInput.ts";
import SceneData from "../data/SceneData.ts";


export default class Game{
    private renderer: Renderer;
    private mouseListener: MouseListener;

    private gameRenderer: GameRenderer;
    private keyInput: KeyInput;
    private characterController: CharacterController;
    private gameCamera: GameCamera;
    private cloudParticles: CloudParticles;
    private gamepadInput: GamePadInput;




    constructor(renderer: Renderer, mouseListener: MouseListener, camera:Camera,gameRenderer:GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;

        this.gameRenderer = gameRenderer;

        this.cloudParticles =new CloudParticles(renderer)
        this.characterController = new CharacterController(renderer,this.cloudParticles)

        this.gameCamera = new GameCamera(renderer,camera);
        this.keyInput =new KeyInput()
        this.gamepadInput = new GamePadInput()
        DebugDraw.init(this.renderer,camera);
        this.setActive();

    }

    update() {

        this.gamepadInput.update();

        this.gameCamera.update()

        let delta  =Timer.delta;

        let jump =this.keyInput.getJump()
        let hInput = this.keyInput.getHdir()
        if(this.gamepadInput.connected){

           if(hInput==0) hInput = this.gamepadInput.getHdir()

            if(!jump) jump =this.gamepadInput.getJump()
        }


        this.characterController.update(delta,hInput,jump)
        this.cloudParticles.update();
        this.checkTriggers()
       // console.log(SceneData.triggerModels)

//last
        DebugDraw.update();
    }
    private checkTriggers() {

       // console.log(this.characterController.targetPos);

        for(let f of    SceneData.triggerModels){
            if(f.checkTriggerHit(this.characterController.targetPos)){
    console.log("hit")
            }

        }

    }
    setActive() {

    }
    draw() {
        this.gameRenderer.draw();

        //SceneData.animations[0].autoPlay(Timer.delta)

    }

    drawInCanvas(pass: CanvasRenderPass) {

        this.gameRenderer.drawFinal(pass);
        DebugDraw.draw(pass);
    }



}
