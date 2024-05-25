import CanvasManager from "./lib/CanvasManager.ts";
import Renderer from "./lib/Renderer.ts";
import CanvasRenderPass from "./CanvasRenderPass.ts";
import CharacterController from "./character/CharacterController.ts";
import Level from "./Level.ts";
import PreLoader from "./lib/PreLoader.ts";
import GLTFLoader from "./GLTFLoader.ts";
import DebugLineModel from "./lib/debug/DebugLineModel.ts";
import {Vector3} from "@math.gl/core";
import ColorV from "./lib/ColorV.ts";
import KeyInput from "./KeyInput.ts";
import UI from "./lib/UI/UI.ts";

export default class Main {
    private canvas: HTMLCanvasElement;
    private canvasManager: CanvasManager;
    private renderer: Renderer;
    private canvasRenderPass!: CanvasRenderPass;

    private characterController!: CharacterController;
    private level!: Level;
    private preloader!: PreLoader;
    private gltfLoader!: GLTFLoader;
    private debugLines!:DebugLineModel;

    private camPhi= Math.PI/2;
    private camTheta=Math.PI/2;



    private camRadius=20;
    private keyInput!: KeyInput;
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
         this.preloader =new PreLoader(()=>{},this.init.bind(this));
            this.gltfLoader = new GLTFLoader(this.renderer,"test",this.preloader)
    }
    private init() {
        this.keyInput = new KeyInput()
        this.canvasRenderPass = new CanvasRenderPass(this.renderer)




        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment);
        this.characterController = new CharacterController(this.renderer,  this.gltfLoader)
        this.characterController.keyInput =this.keyInput
        this.level = new Level(this.renderer)
        this.characterController.levelModels = this.level.models;


        for (let m of this.level.models) {
            this.canvasRenderPass.modelRenderer.addModel(m);
        }

        for (let m of  this.characterController.characterModel.debugModels) {
            this.canvasRenderPass.modelRenderer.addModel(m);
        }

        for (let m of  this.characterController.models) {
            this.canvasRenderPass.modelRenderer.addModel(m);
        }



        this.debugLines =new DebugLineModel(this.renderer)
        this.canvasRenderPass.modelRenderer.addModel(this.debugLines);
        this.tick();
    }

    private tick() {
        window.requestAnimationFrame(() => this.tick());

        this.update();

        UI.updateGPU();
        this.renderer.update(this.draw.bind(this));

    }

    private update() {

       // this.debugLines.drawLine(new Vector3(),new Vector3(2,2,2),new ColorV(1,0,0,0),null)

        this.characterController.update();
        this.canvasRenderPass.update();
        this.canvasRenderPass.camera.fovy=0.5
        this.canvasRenderPass.camera.near=20-10
        this.canvasRenderPass.camera.far=20+10
        if(this.keyInput.camLeft){
            this.keyInput.camLeft=false;
            this.camTheta+=Math.PI/4
        }

        if(this.keyInput.camRight){
            this.keyInput.camRight=false;
            this.camTheta+=Math.PI/4
        }

        if(this.keyInput.camUp){
            this.keyInput.camUp=false;
            this.camPhi-=Math.PI/4
        }
        if(this.keyInput.camDown){
            this.keyInput.camDown=false;
            this.camPhi+=Math.PI/4
        }

        let x=Math.sin( this.camPhi) *Math.cos(this.camTheta)*this.camRadius;
        let  z=Math.sin( this.camPhi) *Math.sin(this.camTheta)*this.camRadius;
        let y =Math.cos(this.camPhi)*this.camRadius;

        this.canvasRenderPass.camera.cameraWorld.set(this.characterController.posX+x,this.characterController.posY+y,z)
        this.canvasRenderPass.camera.cameraLookAt.set(this.characterController.posX,this.characterController.posY,0)

        UI.pushWindow("Dev Settings")
        UI.LFloat("kak"+Math.random(),0);
        UI.popWindow();
    }

    private draw() {
        this.canvasRenderPass.add();

    }
}
