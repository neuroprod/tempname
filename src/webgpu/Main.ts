import CanvasManager from "./lib/CanvasManager.ts";
import Renderer from "./lib/Renderer.ts";
import CanvasRenderPass from "./CanvasRenderPass.ts";

import PreLoader from "./lib/PreLoader.ts";

import KeyInput from "./game/KeyInput.ts";
import UI from "./lib/UI/UI.ts";
import ModelMaker from "./modelMaker/ModelMaker.ts";
import MouseListener from "./lib/MouseListener.ts";
import ModelLoader from "./ModelLoader.ts";
import Scene from "./scene/Scene.ts";
import JsonLoader from "./JsonLoader.ts";
import GameRenderer from "./render/GameRenderer.ts";
import AnimationEditor from "./scene/timeline/AnimationEditor.ts";
import TextureLoader from "./lib/textures/TextureLoader.ts";
import UI_IC from "./lib/UI/UI_IC.ts";
import UI_I from "./lib/UI/UI_I.ts";
import Component, {ComponentSettings} from "./lib/UI/components/Component.ts";
import TestUI from "./UI/TestUI.ts";
import SDFFont from "./lib/UI/draw/SDFFont.ts";
import {popMainMenu, pushMainMenu} from "./UI/MainMenu.ts";
import {popToolBar, pushToolBar} from "./UI/ToolBar.ts";
import {addMainMenuButton} from "./UI/MainMenuButton.ts";


enum MainState {

    modelMaker,
    editor,

}


export default class Main {
    private canvas: HTMLCanvasElement;
    private canvasManager: CanvasManager;
    private renderer: Renderer;
    private canvasRenderPass!: CanvasRenderPass;


    private preloader!: PreLoader;


    private keyInput!: KeyInput;
    private modelMaker!: ModelMaker;
    private mouseListener!: MouseListener;
    private modelLoader!: ModelLoader;

    private currentMainState!: MainState
    private scene!: Scene;
    private sceneLoader!: JsonLoader;


    constructor() {

        this.canvas = document.getElementById("webGPUCanvas") as HTMLCanvasElement;
        this.canvasManager = new CanvasManager(this.canvas);
        this.renderer = new Renderer();
        this.renderer.setup(this.canvas).then(() => {
            this.preload()
        }).catch((e) => {
        console.warn("no WebGPU ->"+e);
        })
        var s = '';
        for (var i=32; i<=127;i++) s += String.fromCharCode(i);
        console.log(s)
let f =new SDFFont()


    }

    public preload() {
        UI.setWebGPU(this.renderer)

       // let font =new SDFFont();

        //setup canvas
        this.canvasRenderPass = new CanvasRenderPass(this.renderer)
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment);

        this.preloader = new PreLoader(() => {
        }, this.init.bind(this));
        this.modelLoader = new ModelLoader(this.renderer, this.preloader)
        this.sceneLoader =new JsonLoader("scene1",this.preloader)
        console.log("go")

    }



    private init() {
        console.log("go")
        this.keyInput = new KeyInput();
        this.mouseListener = new MouseListener(this.renderer);

        this.scene = new Scene(this.renderer, this.mouseListener, this.modelLoader.data,this.sceneLoader.data)
        this.modelMaker = new ModelMaker(this.renderer, this.mouseListener, this.modelLoader.data);



        this.setMainState(MainState.editor)
        this.tick();
    }
    private setMainState(state: MainState) {
        this.currentMainState = state;
    }
    private tick() {
        window.requestAnimationFrame(() => this.tick());
        this.update();
        UI.updateGPU();

        this.renderer.update(this.draw.bind(this));
        this.mouseListener.reset();
    }

    private update() {
        if (this.currentMainState == MainState.editor) {
            this.scene.update()
        }
        if (this.currentMainState == MainState.modelMaker) {
            this.modelMaker.update()
        }
        this.onUI()
    }

    private onUI() {

        pushMainMenu()
        //addMainMenuButton("Site","a");
        addMainMenuButton("Scene Editor","d");
        addMainMenuButton("Model Maker","d");

        popMainMenu()

        pushToolBar()
        popToolBar()
     /*let s = new ComponentSettings()
        s.hasBackground =true;
        s.backgroundColor.setHex('#0059ff',1);
        s.box.size.set(100,100)
        s.box.setMargin(0)
        s.box.setPadding(0);
        UI_I.currentComponent = UI_I.panelLayer;
        if (!UI_I.setComponent("kaka")) {

            let comp = new TestUI(UI_I.getID("kaka"), s);
            UI_I.addComponent(comp);
        }

        UI_I.popComponent()*/


        UI.pushWindow("Main")
        this.scene.gameRenderer.onUI()
        if (UI.LButton("Editor", "Views", this.currentMainState != MainState.editor)) this.setMainState(MainState.editor);
        if (UI.LButton("ModelMaker", "", this.currentMainState != MainState.modelMaker)) this.setMainState(MainState.modelMaker);
        UI.separator("msep",false)
       if(this.currentMainState== MainState.modelMaker){
           this.modelMaker.onUI()
       }  else if(this.currentMainState== MainState.editor){
            this.scene.onUI()
           UI.popWindow()
           this.scene.onObjectUI()
           AnimationEditor.onUI();
        }


    }

    private draw() {
        if (this.currentMainState == MainState.modelMaker) {
            this.modelMaker.draw()
            this.canvasRenderPass.drawInCanvas = this.modelMaker.drawInCanvas.bind(this.modelMaker);
        }
        if (this.currentMainState == MainState.editor) {
            this.scene.draw()


            this.canvasRenderPass.drawInCanvas = this.scene.drawInCanvas.bind(this.scene);
        }
        this.canvasRenderPass.add();

    }


}
