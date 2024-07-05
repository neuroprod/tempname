import CanvasManager from "./lib/CanvasManager.ts";
import Renderer from "./lib/Renderer.ts";
import CanvasRenderPass from "./CanvasRenderPass.ts";

import PreLoader from "./lib/PreLoader.ts";
import KeyInput from "./game/KeyInput.ts";
import UI from "./lib/UI/UI.ts";
import ModelMaker from "./modelMaker/ModelMaker.ts";
import MouseListener from "./lib/MouseListener.ts";
import SceneEditor from "./sceneEditor/SceneEditor.ts";
import SDFFont from "./lib/UI/draw/SDFFont.ts";
import {popMainMenu, pushMainMenu} from "./UI/MainMenu.ts";
import AppState, {AppStates} from "./AppState.ts";
import {Icons} from "./UI/Icons.ts";
import {addMainMenuToggleButton} from "./UI/MainMenuToggleButton.ts";
import TextureLoader from "./lib/textures/TextureLoader.ts";
import SceneData from "./data/SceneData.ts";
import {addMainMenuTextButton} from "./UI/MainMenuTextButton.ts";
import UI_I from "./lib/UI/UI_I.ts";
import {addMainMenuDivider} from "./UI/MainMenuDivider.ts";
import {Textures} from "./data/Textures.ts";
import Camera from "./lib/Camera.ts";
import GameRenderer from "./render/GameRenderer.ts";
import Game from "./Website/Game.ts";


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


    private currentMainState!: MainState
    private camera!: Camera;
    private gameRenderer!: GameRenderer;
    private game!: Game;


    constructor() {
        AppState.init()
        this.canvas = document.getElementById("webGPUCanvas") as HTMLCanvasElement;
        this.canvasManager = new CanvasManager(this.canvas);
        this.renderer = new Renderer();
        this.renderer.setup(this.canvas).then(() => {
            this.preload()
        })

        let f = new SDFFont()


    }

    public preload() {
        UI.setWebGPU(this.renderer)


        //setup canvas
        this.canvasRenderPass = new CanvasRenderPass(this.renderer)
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment);

        this.preloader = new PreLoader((n) => {
            //onPreload
        }, this.init.bind(this));
        //Todo handle bitmap preload
        new TextureLoader(this.renderer, "bezierPoints.png")
        new TextureLoader(this.renderer, Textures.MAINFONT)
        new TextureLoader(this.renderer, Textures.BLUE_NOISE)
        new TextureLoader(this.renderer, Textures.DRAWING_BACKGROUND)
        // this.modelLoader = new ModelLoader(this.renderer, this.preloader)
        // this.sceneLoader = new JsonLoader("scene1", this.preloader)
        SceneData.init(this.renderer, this.preloader)

    }


    private init() {

        SceneData.parseSceneData();

        this.camera = new Camera(this.renderer);
        this.camera.cameraWorld.set(0.5, 0.3, 2)
        this.camera.cameraLookAt.set(0, 0.2, 0)
        this.camera.near = 0.5
        this.camera.far = 100
        this.camera.fovy = 0.8

        this.gameRenderer = new GameRenderer(this.renderer, this.camera)
        this.gameRenderer.gBufferPass.modelRenderer.setModels(SceneData.usedModels);
        this.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneData.usedModels);


        this.keyInput = new KeyInput();
        this.mouseListener = new MouseListener(this.renderer);


        this.game = new Game(this.renderer, this.mouseListener, this.camera, this.gameRenderer)
        SceneEditor.init(this.renderer, this.mouseListener, this.camera, this.gameRenderer)
        this.modelMaker = new ModelMaker(this.renderer, this.mouseListener);

        let state = AppState.getState(AppStates.MAIN_STATE);
        if (state != undefined) {
            this.setMainState(state)
        } else {
            this.setMainState(MainState.game)
        }

        this.tick();
    }

    private setMainState(state: MainState) {
        AppState.setState(AppStates.MAIN_STATE, state);
        if (this.currentMainState == MainState.modelMaker) {
            this.modelMaker.saveTemp()
        }
        if (state == MainState.modelMaker) {
            this.modelMaker.setProject()
        }
        if (state == MainState.editor) {
           SceneEditor.setActive()
        }
        if (state == MainState.game) {
           this.game.setActive()
        }
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
            SceneEditor.update();
        } else if (this.currentMainState == MainState.modelMaker) {
            this.modelMaker.update();
        } else if (this.currentMainState == MainState.game) {
            this.game.update();
        }
        this.onUI()
    }

    private onUI() {
        if (this.currentMainState == MainState.game) {
            // pushMainMenu("editMenu", 74, 0)
           /* UI_I.currentComponent = UI_I.panelLayer;
            if (addMainMenuTextButton("Edit", true)) {
                this.setMainState(MainState.editor)
            }*/
            // popMainMenu()
        } else {
            pushMainMenu("MainMenu", 207, 0)
            if (addMainMenuToggleButton("Game", Icons.GAME, false)) this.setMainState(MainState.game);
            if (addMainMenuToggleButton("Scene Editor", Icons.CUBE, this.currentMainState == MainState.editor)) this.setMainState(MainState.editor);
            if (addMainMenuToggleButton("Model Maker", Icons.PAINT, this.currentMainState == MainState.modelMaker)) this.setMainState(MainState.modelMaker);
            addMainMenuDivider("div")
            if (addMainMenuTextButton("Save", true)) {
                this.saveAll();
            }
            popMainMenu()
        }
        if (this.currentMainState == MainState.modelMaker) {

            this.modelMaker.onUINice()

        } else if (this.currentMainState == MainState.editor) {

            SceneEditor.onUINice()
        }


    }

    private draw() {
        if (this.currentMainState == MainState.modelMaker) {
            this.modelMaker.draw()
            this.canvasRenderPass.drawInCanvas = this.modelMaker.drawInCanvas.bind(this.modelMaker);
        } else if (this.currentMainState == MainState.editor) {
            SceneEditor.draw()
            this.canvasRenderPass.drawInCanvas = SceneEditor.drawInCanvas.bind(SceneEditor);
        } else if (this.currentMainState == MainState.game) {
            this.game.draw()
            this.canvasRenderPass.drawInCanvas = this.game.drawInCanvas.bind(this.game);
        }
        this.canvasRenderPass.add();

    }


    private saveAll() {
        SceneEditor.saveAll()
        this.modelMaker.saveAll();
    }
}
