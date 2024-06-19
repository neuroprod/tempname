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
import AnimationEditor from "./scene/timeline/AnimationEditor.ts";
import SDFFont from "./lib/UI/draw/SDFFont.ts";
import {popMainMenu, pushMainMenu} from "./UI/MainMenu.ts";
import {addMainMenuButton} from "./UI/MainMenuButton.ts";
import AppState, {AppStates} from "./AppState.ts";


enum MainState {

    modelMaker,
    editor,
    game,

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
        AppState.init()
        this.canvas = document.getElementById("webGPUCanvas") as HTMLCanvasElement;
        this.canvasManager = new CanvasManager(this.canvas);
        this.renderer = new Renderer();
        this.renderer.setup(this.canvas).then(() => {
            this.preload()
        }).catch((e) => {
            console.warn("no WebGPU ->" + e);
        })

        let f = new SDFFont()


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
        this.sceneLoader = new JsonLoader("scene1", this.preloader)


    }


    private init() {

        this.keyInput = new KeyInput();
        this.mouseListener = new MouseListener(this.renderer);

        this.scene = new Scene(this.renderer, this.mouseListener, this.modelLoader.data, this.sceneLoader.data)
        this.modelMaker = new ModelMaker(this.renderer, this.mouseListener, this.modelLoader.data);


        let state = AppState.getState(AppStates.MAIN_STATE)
        if (state != undefined) {
            this.setMainState(state)
        } else {
            this.setMainState(MainState.game)
        }

        this.tick();
    }

    private setMainState(state: MainState) {

        console.log(state)
        AppState.setState(AppStates.MAIN_STATE, state)
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
        if (addMainMenuButton("Game", "e", this.currentMainState == MainState.game)) this.setMainState(MainState.game);
        if (addMainMenuButton("Scene Editor", "d", this.currentMainState == MainState.editor)) this.setMainState(MainState.editor);
        if (addMainMenuButton("Model Maker", "b", this.currentMainState == MainState.modelMaker)) this.setMainState(MainState.modelMaker);

        popMainMenu()


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

        if (this.currentMainState != MainState.game) {
            UI.pushWindow("Main")
            this.scene.gameRenderer.onUI()
            //  if (UI.LButton("Editor", "Views", this.currentMainState != MainState.editor)) this.setMainState(MainState.editor);
            // if (UI.LButton("ModelMaker", "", this.currentMainState != MainState.modelMaker)) this.setMainState(MainState.modelMaker);
            UI.separator("msep", false)
            if (this.currentMainState == MainState.modelMaker) {


                this.modelMaker.onUI()
            } else if (this.currentMainState == MainState.editor) {
                this.scene.onUI()
                UI.popWindow()
                this.scene.onObjectUI()
                AnimationEditor.onUI();

                this.scene.onUINice()
            }
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
