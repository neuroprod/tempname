import CanvasManager from "./lib/CanvasManager.ts";
import Renderer from "./lib/Renderer.ts";
import CanvasRenderPass from "./CanvasRenderPass.ts";
import CharacterController from "./CharacterController.ts";
import Level from "./Level.ts";

export default class Main {
    private canvas: HTMLCanvasElement;
    private canvasManager: CanvasManager;
    private renderer: Renderer;
    private canvasRenderPass!: CanvasRenderPass;

    private characterController: CharacterController;
    private level: Level;

    constructor() {

        this.canvas = document.getElementById("webGPUCanvas") as HTMLCanvasElement;
        this.canvasManager = new CanvasManager(this.canvas);
        this.renderer = new Renderer();
        this.renderer.setup(this.canvas).then(() => {
            setTimeout(this.init.bind(this), 1000);
        }).catch((e) => {
            // console.warn("no WebGPU ->"+e);
        })

    }

    private init() {

        this.canvasRenderPass = new CanvasRenderPass(this.renderer)

        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment);
        this.characterController = new CharacterController(this.renderer)
        this.level = new Level(this.renderer)
        this.characterController.levelModels = this.level.models;

        this.canvasRenderPass.modelRenderer.addModel(this.characterController.model)
        for (let m of this.level.models) {
            this.canvasRenderPass.modelRenderer.addModel(m);
        }
        this.tick();
    }

    private tick() {
        window.requestAnimationFrame(() => this.tick());
        this.update();
        this.renderer.update(this.draw.bind(this));
    }

    private update() {
        this.characterController.update();
        this.canvasRenderPass.update();
    }

    private draw() {
        this.canvasRenderPass.add();

    }
}
