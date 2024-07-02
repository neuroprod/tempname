import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import Camera from "../lib/Camera.ts";
import GameRenderer from "../render/GameRenderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import SceneData from "../data/SceneData.ts";
import Timer from "../lib/Timer.ts";

export default class Game{
    private renderer: Renderer;
    private mouseListener: MouseListener;
    private camera: Camera;
    private gameRenderer: GameRenderer;

    constructor(renderer: Renderer, mouseListener: MouseListener, camera:Camera,gameRenderer:GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera = camera
        this.gameRenderer = gameRenderer;


    }

    update() {
        this.camera.ratio = this.renderer.ratio
        this.camera.cameraWorld.set(0.1, 0.3, 1.5)
        this.camera.cameraLookAt.set(0, 0.2, 0)
        this.camera.cameraUp.set(0,1,0)
    }

    draw() {
        this.gameRenderer.draw();

        SceneData.animations[0].autoPlay(Timer.delta)
    }

    drawInCanvas(pass: CanvasRenderPass) {

        this.gameRenderer.drawFinal(pass);

    }

}
