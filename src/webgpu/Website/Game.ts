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
import CloudParticles from "./CloudParticles.ts";
import GamePadInput from "./GamePadInput.ts";
import SceneData from "../data/SceneData.ts";
import CoinHandler from "./handlers/CoinHandler.ts";
import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import {HitTrigger} from "../data/HitTriggers.ts";
import SoundHandler from "./SoundHandler.ts";
import StrawBerryScene from "./cutscenes/StrawBerryScene.ts";
import TextBalloonHandler from "./conversation/TextBalloonHandler.ts";
import ConversationHandler from "./conversation/ConversationHandler.ts";



export default class Game {
    private renderer: Renderer;
    private mouseListener: MouseListener;

    private gameRenderer: GameRenderer;
    private keyInput: KeyInput;
    private characterController: CharacterController;
    private gameCamera: GameCamera;
    private cloudParticles: CloudParticles;
    private gamepadInput: GamePadInput;
    private coinHandler: CoinHandler;
    private strawberryScene: StrawBerryScene;
    private isCutScene: boolean = false;
    private textBalloonHandler: TextBalloonHandler;
    private conversationHandler: ConversationHandler;


    constructor(renderer: Renderer, mouseListener: MouseListener, camera: Camera, gameRenderer: GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;

        this.gameRenderer = gameRenderer;

        this.cloudParticles = new CloudParticles(renderer)
        this.characterController = new CharacterController(renderer, this.cloudParticles)

        this.gameCamera = new GameCamera(renderer, camera);
        this.keyInput = new KeyInput()
        this.gamepadInput = new GamePadInput()

        this.textBalloonHandler =new TextBalloonHandler(renderer,this.gameCamera.camera)
        this.conversationHandler = new ConversationHandler(renderer,this.textBalloonHandler)
        this.coinHandler = new CoinHandler()


        this.strawberryScene = new StrawBerryScene()


        DebugDraw.init(this.renderer, camera);
        this.setActive();
        SoundHandler.init()
    }

    update() {

        this.gamepadInput.update();
        let delta = Timer.delta;
        let jump = this.keyInput.getJump()
        let hInput = this.keyInput.getHdir()
        if (this.gamepadInput.connected) {

            if (hInput == 0) hInput = this.gamepadInput.getHdir()

            if (!jump) jump = this.gamepadInput.getJump()
        }

        if(this.strawberryScene.finished){
            this.isCutScene =false;
        }

        if (!this.isCutScene) {
            this.characterController.update(delta, hInput, jump)
            this.gameCamera.update()

        } else {
            this.strawberryScene.update();
            this.strawberryScene.setInput(hInput, jump)
        }

        this.cloudParticles.update();
        this.coinHandler.update();
        this.checkTriggers()

        this.textBalloonHandler.update()
//last
        DebugDraw.update();
    }

    resolveHitTrigger(obj: SceneObject3D) {
        switch (obj.hitTriggerItem) {
            case HitTrigger.COIN:
                console.log("hitCoin")
                obj.triggerIsEnabled = false
                obj.hide()
                SoundHandler.playCoin()
                break
            case HitTrigger.STRAWBERRY:
                obj.triggerIsEnabled = false
                this.setCutScene(this.strawberryScene)
                break


        }
    }

    setActive() {

    }

    draw() {
        this.gameRenderer.draw();

        //SceneData.animations[0].autoPlay(Timer.delta)

    }

    drawInCanvas(pass: CanvasRenderPass) {

        this.gameRenderer.drawFinal(pass);
        this.textBalloonHandler.drawFinal(pass)
        DebugDraw.draw(pass);
    }

    private checkTriggers() {

        // console.log(this.characterController.targetPos);

        for (let f of SceneData.triggerModels) {
            f.drawTrigger()
            if (f.checkTriggerHit(this.characterController.charHitBottomWorld, this.characterController.charHitTopWorld, this.characterController.charHitRadius)) {


                this.resolveHitTrigger(f)

            }

        }

    }

    private setCutScene(strawberryScene: StrawBerryScene) {
        strawberryScene.characterController =this.characterController
        strawberryScene.gameCamera = this.gameCamera;
        strawberryScene.conversationHandler =this.conversationHandler;
        strawberryScene.start();
        this.isCutScene = true;

    }
}
