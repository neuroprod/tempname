import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import Camera from "../lib/Camera.ts";
import GameRenderer from "../render/GameRenderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";


import KeyInput from "./KeyInput.ts";

import GameCamera from "./GameCamera.ts";
import DebugDraw from "./DebugDraw.ts";
import GamePadInput from "./GamePadInput.ts";

import SoundHandler from "./SoundHandler.ts";

import LoadHandler from "../data/LoadHandler.ts";
import UI from "../lib/UI/UI.ts";
import LevelHandler from "./Levels/LevelHandler.ts";
import GameModel from "./GameModel.ts";
import TextBalloonHandler from "./conversation/TextBalloonHandler.ts";

import ConversationHandler from "./conversation/ConversationHandler.ts";
import AppState from "../AppState.ts";
import Overlay from "./Overlay.ts";
import CoinHandler from "./handlers/CoinHandler.ts";


export default class Game {
    private renderer: Renderer;
    private mouseListener: MouseListener;
    private gameRenderer: GameRenderer;
    private keyInput: KeyInput;
    private gameCamera: GameCamera;
    private gamepadInput: GamePadInput;

    private textBalloonHandler: TextBalloonHandler;
    private conversationHandler: ConversationHandler;
    private overlay: Overlay;

    constructor(renderer: Renderer, mouseListener: MouseListener, camera: Camera, gameRenderer: GameRenderer) {

        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.gameRenderer = gameRenderer;

        this.gameCamera = new GameCamera(renderer, camera);
        this.overlay =new Overlay(renderer)
        GameModel.overlay =   this.overlay;
        this.textBalloonHandler = new TextBalloonHandler(this.renderer, this.gameCamera.camera)
        this.conversationHandler = new ConversationHandler(this.renderer, this.textBalloonHandler)
        this.keyInput = new KeyInput()
        this.gamepadInput = new GamePadInput()


       GameModel.renderer = renderer;
       GameModel.gameRenderer = this.gameRenderer;
       GameModel.gameCamera = this.gameCamera
       GameModel.gamepadInput = this.gamepadInput
       GameModel.keyInput = this.keyInput
       GameModel.textBalloonHandler = this.textBalloonHandler
       GameModel.conversationHandler = this.conversationHandler;
       GameModel.mouseListener = this.mouseListener;
        GameModel.coinHandeler = new CoinHandler(renderer)
        LevelHandler.init()
        SoundHandler.init()
    }

    update() {
        this.setGUI();

        if (LoadHandler.isLoading()) return


        this.gamepadInput.update();
        if (LevelHandler.currentLevel) {
            LevelHandler.currentLevel.updateMouse()
            LevelHandler.currentLevel.update()
        }

        this.gameCamera.update()
        GameModel.coinHandeler.update()
        this.textBalloonHandler.update()
this.overlay.update()
        DebugDraw.update();

    }


    setActive() {
        let newName = AppState.getState("currentLevel");
        if(!newName){
            LevelHandler.setLevel("Start")
        }else{
            LevelHandler.setLevel(newName)
        }


    }


    draw() {
        if (LoadHandler.isLoading()) return
        this.gameRenderer.draw();
    }

    drawInCanvas(pass: CanvasRenderPass) {
        if (LoadHandler.isLoading()) return
        this.gameRenderer.drawFinal(pass);


        DebugDraw.draw(pass);
        this.overlay.draw(pass)
    }


    private setGUI() {
        UI.pushWindow("Game")

        for (let l of LevelHandler.levelKeys) {
            if (UI.LButton(l)) {
                LevelHandler.setLevel(l)
            }
        }
        LevelHandler.onUI()
        UI.popWindow()
    }
}
