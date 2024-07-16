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
export default class Game{
    private renderer: Renderer;
    private mouseListener: MouseListener;

    private gameRenderer: GameRenderer;
    private keyInput: KeyInput;
    private characterController: CharacterController;
    private gameCamera: GameCamera;




    constructor(renderer: Renderer, mouseListener: MouseListener, camera:Camera,gameRenderer:GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;

        this.gameRenderer = gameRenderer;

        this.characterController = new CharacterController(renderer)
        this.gameCamera = new GameCamera(renderer,camera);
        this.keyInput =new KeyInput()
        DebugDraw.init(this.renderer,camera);
        this.setActive();

    }

    update() {
        this.gameCamera.update()

        let delta  =Timer.delta;
        let jump =this.keyInput.getJump()
        let hInput = this.keyInput.getHdir()
        this.characterController.update(delta,hInput,jump)

//last
        DebugDraw.update();
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
