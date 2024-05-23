import CanvasManager from "./lib/CanvasManager.ts";
import Renderer from "./lib/Renderer.ts";
import CanvasRenderPass from "./CanvasRenderPass.ts";
import CharacterController from "./CharacterController.ts";
import Level from "./Level.ts";
import PreLoader from "./lib/PreLoader.ts";
import GLTFLoader from "./GLTFLoader.ts";

export default class Main {
    private canvas: HTMLCanvasElement;
    private canvasManager: CanvasManager;
    private renderer: Renderer;
    private canvasRenderPass!: CanvasRenderPass;

    private characterController: CharacterController;
    private level: Level;
    private preloader: PreLoader;
    private gltfLoader: GLTFLoader;

    constructor() {

        this.canvas = document.getElementById("webGPUCanvas") as HTMLCanvasElement;
        this.canvasManager = new CanvasManager(this.canvas);
        this.renderer = new Renderer();
        this.renderer.setup(this.canvas).then(() => {
            this.preload()
        }).catch((e) => {
            // console.warn("no WebGPU ->"+e);
        })

    }
    public preload(){
         this.preloader =new PreLoader(()=>{},this.init.bind(this));
            this.gltfLoader = new GLTFLoader(this.renderer,"test",this.preloader)
    }
    private init() {

        this.canvasRenderPass = new CanvasRenderPass(this.renderer)

        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment);
        this.characterController = new CharacterController(this.renderer,  this.gltfLoader)
        this.level = new Level(this.renderer)
        this.characterController.levelModels = this.level.models;

        this.canvasRenderPass.modelRenderer.addModel(this.characterController.model)
        for (let m of this.level.models) {
            this.canvasRenderPass.modelRenderer.addModel(m);
        }
        for (let m of  this.characterController.models) {
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
