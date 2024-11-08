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
import LevelData from "./Levels/LevelData.ts";
import TextBalloonHandler from "./conversation/TextBalloonHandler.ts";

import ConversationHandler from "./conversation/ConversationHandler.ts";


export default class Game {
    private renderer: Renderer;
    private mouseListener: MouseListener;
    private gameRenderer: GameRenderer;
    private keyInput: KeyInput;
    private gameCamera: GameCamera;
    private gamepadInput: GamePadInput;
    private levelObjects: LevelData;
    private textBalloonHandler: TextBalloonHandler;
    private conversationHandler:ConversationHandler;

    constructor(renderer: Renderer, mouseListener: MouseListener, camera: Camera, gameRenderer: GameRenderer) {

        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.gameRenderer = gameRenderer;

        this.gameCamera = new GameCamera(renderer, camera);

        this.textBalloonHandler =new TextBalloonHandler(this.renderer,this.gameCamera.camera)
        this.conversationHandler =new ConversationHandler(this.renderer,this.textBalloonHandler)
        this.keyInput = new KeyInput()
        this.gamepadInput = new GamePadInput()

        this.levelObjects = new LevelData()
        this.levelObjects.renderer =renderer;
        this.levelObjects.gameRenderer = this.gameRenderer;
        this.levelObjects.gameCamera =this.gameCamera
        this.levelObjects.gamepadInput=this.gamepadInput
        this.levelObjects.keyInput=this.keyInput
        this.levelObjects.textBalloonHandler =this.textBalloonHandler
        this.levelObjects.conversationHandler =this.conversationHandler;

        LevelHandler.init(this.levelObjects)
        SoundHandler.init()
    }

    update() {
        this.setGUI();

        if (LoadHandler.isLoading()) return

        this.gamepadInput.update();
        LevelHandler.currentLevel.update()
        this.gameCamera.update()
        this.textBalloonHandler.update()

        DebugDraw.update();

    }


    setActive() {
       // LevelHandler.setLevel("Start")
        LevelHandler.setLevel("GodChoice")
    }

    draw() {
        if (LoadHandler.isLoading()) return

        this.gameRenderer.draw();


    }

    drawInCanvas(pass: CanvasRenderPass) {
        if (LoadHandler.isLoading()) return
        this.gameRenderer.drawFinal(pass);
         this.textBalloonHandler.drawFinal(pass)
        DebugDraw.draw(pass);
    }





    private setGUI() {
        UI.pushWindow("Game")

        for(let l of LevelHandler.levelKeys){
            if(UI.LButton(l)){
                LevelHandler.setLevel(l)
            }
        }

        UI.popWindow()
    }
}
