import CanvasManager from "./lib/CanvasManager.ts";
import Renderer from "./lib/Renderer.ts";
import CanvasRenderPass from "./CanvasRenderPass.ts";
import CharacterController from "./game/character/CharacterController.ts";
import Level from "./game/Level.ts";
import PreLoader from "./lib/PreLoader.ts";
import GLTFLoader from "./game/GLTFLoader.ts";
import DebugLineModel from "./lib/debug/DebugLineModel.ts";
import {Vector3} from "@math.gl/core";
import ColorV from "./lib/ColorV.ts";
import KeyInput from "./game/KeyInput.ts";
import UI from "./lib/UI/UI.ts";
import ModelMaker from "./modelMaker/ModelMaker.ts";
import MouseListener from "./lib/MouseListener.ts";
import ModelLoader from "../ModelLoader.ts";

export default class Main {
    private canvas: HTMLCanvasElement;
    private canvasManager: CanvasManager;
    private renderer: Renderer;
    private canvasRenderPass!: CanvasRenderPass;


    private preloader!: PreLoader;





    private keyInput!: KeyInput;
    private modelMaker!:ModelMaker;
    private mouseListener!: MouseListener;
    private modelLoader!: ModelLoader;
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
        UI.setWebGPU(this.renderer)
        //setup canvas
        this.canvasRenderPass = new CanvasRenderPass(this.renderer)
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment);



         this.preloader =new PreLoader(()=>{},this.init.bind(this));
        this.modelLoader = new ModelLoader(this.renderer,this.preloader)




    }
    private init() {
        this.keyInput = new KeyInput();
        this.mouseListener = new MouseListener();



        this.modelMaker =new ModelMaker(this.renderer,this.mouseListener,   this.modelLoader.data);
        this.canvasRenderPass.drawInCanvas =this.modelMaker.drawInCanvas.bind(this.modelMaker);


        this.tick();
    }

    private tick() {
        window.requestAnimationFrame(() => this.tick());

        this.update();

        UI.updateGPU();
        this.renderer.update(this.draw.bind(this));
        this.mouseListener.reset();
    }

    private update() {

        this.modelMaker.update( )

    }

    private draw() {
        this.modelMaker.draw()
        this.canvasRenderPass.add();

    }
}
