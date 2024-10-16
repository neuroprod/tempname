import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import Camera from "../lib/Camera.ts";
import GameRenderer from "../render/GameRenderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";

import Timer from "../lib/Timer.ts";

import KeyInput from "./KeyInput.ts";
import CharacterController from "./CharacterController.ts";
import GameCamera from "./GameCamera.ts";
import DebugDraw from "./DebugDraw.ts";
import GamePadInput from "./GamePadInput.ts";
import SceneObject3D from "../data/SceneObject3D.ts";
import {HitTrigger} from "../data/HitTriggers.ts";
import SoundHandler from "./SoundHandler.ts";
import StrawBerryScene from "./cutscenes/StrawBerryScene.ts";
import ConversationHandler from "./conversation/ConversationHandler.ts";
import SceneHandler from "../data/SceneHandler.ts";
import LoadHandler from "../data/LoadHandler.ts";
import UI from "../lib/UI/UI.ts";
import LevelHandler from "./Levels/LevelHandler.ts";
import LevelObjects from "./Levels/LevelObjects.ts";


export default class Game {
    private renderer: Renderer;
    private mouseListener: MouseListener;

    private gameRenderer: GameRenderer;
    private keyInput: KeyInput;

    private gameCamera: GameCamera;

    private gamepadInput: GamePadInput;

    private levelObjects: LevelObjects;


    constructor(renderer: Renderer, mouseListener: MouseListener, camera: Camera, gameRenderer: GameRenderer) {

        this.renderer = renderer;





        this.mouseListener = mouseListener;

        this.gameRenderer = gameRenderer;


        this.gameCamera = new GameCamera(renderer, camera);

        this.keyInput = new KeyInput()
        this.gamepadInput = new GamePadInput()

        this.levelObjects = new LevelObjects()
        this.levelObjects.renderer =renderer;
        this.levelObjects.gameRenderer = this.gameRenderer;
        this.levelObjects.gameCamera =this.gameCamera
        this.levelObjects.gamepadInput=this.gamepadInput
        this.levelObjects.keyInput=this.keyInput


        LevelHandler.init(this.levelObjects)
        SoundHandler.init()
    }

    update() {
        this.setGUI();

        if (LoadHandler.isLoading()) return


        this.gamepadInput.update();
        LevelHandler.currentLevel.update()
        this.gameCamera.update()
        DebugDraw.update();
    }


    setActive() {
        LevelHandler.setLevel("God")

    }

    draw() {
        if (LoadHandler.isLoading()) return

        this.gameRenderer.draw();


    }

    drawInCanvas(pass: CanvasRenderPass) {
        if (LoadHandler.isLoading()) return
        this.gameRenderer.drawFinal(pass);
        //  this.textBalloonHandler.drawFinal(pass)
        DebugDraw.draw(pass);
    }

    private checkTriggers() {


        /* for (let f of SceneData.triggerModels) {
             f.drawTrigger()
             if (f.checkTriggerHit(this.characterController.charHitBottomWorld, this.characterController.charHitTopWorld, this.characterController.charHitRadius)) {


                 this.resolveHitTrigger(f)

             }

         }*/

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
