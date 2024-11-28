import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";

import {Vector3} from "@math.gl/core";
import Kris from "./Kris.ts";

import gsap from "gsap";
import Bezier from "../../../lib/path/Bezier.ts";
import CharacterController from "../../CharacterController.ts";
import Timer from "../../../lib/Timer.ts";
import MouseInteractionWrapper from "../../MouseInteractionWrapper.ts";
import LevelHandler from "../LevelHandler.ts";
import SoundHandler from "../../SoundHandler.ts";
import GameModel from "../../GameModel.ts";

export class StartLevel extends BaseLevel {

    private kris!: Kris;


    private camPos = new Vector3()
    private camTarget = new Vector3()

    private characterController!: CharacterController;


    init() {
        super.init();
        this.characterController = new CharacterController(GameModel.renderer)
        LoadHandler.onComplete = this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()


        SceneHandler.setScene("456").then(() => {
            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });
            SceneHandler.addScene("f26911cf-86dc-498a").then(() => {
                LoadHandler.stopLoading()
            });
            LoadHandler.stopLoading()
        })

    }

    update() {
        super.update();
        if (this.kris) this.kris.update()

        this.characterController.updateIdle(Timer.delta)
        /*if(this.intro.done && GameModel.keyInput.getJump()){
            this.intro.done =false;
            console.log("move")
            this.moveToStartPos();
        }*/


    }

    private configScene() {

        LoadHandler.onComplete = () => {
        }

        GameModel.gameRenderer.setModels(SceneHandler.allModels)
        GameModel.gameRenderer.setLevelType("platform")
        this.setMouseHitObjects(SceneHandler.mouseHitModels);


        if (!this.kris) this.kris = new Kris()
        this.kris.reset()

        let char = sceneHandler.getSceneObject("charRoot")
        char.x = -2;
        char.y = 1;
        this.characterController.setCharacter()

        this.camPos.set(0, 0.7, 2)
        this.camTarget.set(0, 0.7, 0)
        GameModel.gameCamera.setLockedView(this.camTarget.add([0, 0, 0]), this.camPos.clone().add([0, 0, 1]))
        GameModel.gameCamera.TweenToLockedView(this.camTarget, this.camPos, 3)


        let kris = this.mouseInteractionMap.get("kris") as MouseInteractionWrapper
        kris.onClick = () => {
            SoundHandler.playSound =true
            gsap.to(pirate, {sx: 0, sy: 0, sz: 0, duration: 0.2})
            gsap.to(graphicsDev, {sx: 0, sy: 0, sz: 0, duration: 0.2})
            this.kris.jump()
            this.kris.stopWave()
            gsap.delayedCall(1.5, () => {
                LevelHandler.setLevel("Website")
            })
            // LevelHandler.setLevel("Website")
        }
        kris.onRollOver =()=>{
            this.kris.startWave()

        }
        kris.onRollOut =()=>{
            this.kris.stopWave()

        }

        let mainChar = this.mouseInteractionMap.get("mainChar") as MouseInteractionWrapper
        mainChar.onClick = () => {
            SoundHandler.playSound =true
            gsap.to(pirate, {sx: 0, sy: 0, sz: 0, duration: 0.2})
            gsap.to(graphicsDev, {sx: 0, sy: 0, sz: 0, duration: 0.2})
            this.characterController.gotoAndIdle(new Vector3(3, 0.1, 0), 1, () => {
                LevelHandler.setLevel("God")
            })
        }
        mainChar.onRollOver =()=>{
            this.characterController.startWave()

        }
        mainChar.onRollOut =()=>{
            this.characterController.stopWave()

        }
        this.kris.show();
        this.characterController.gotoAndIdle(new Vector3(0, 0.1, 0), 1, () => {
        })

        let choose = SceneHandler.getSceneObject("choose")
        let your = SceneHandler.getSceneObject("your")
        let hero = SceneHandler.getSceneObject("hero")
        let exMark = SceneHandler.getSceneObject("exMark")
        choose.setScaler(0)
        your.setScaler(0)
        hero.setScaler(0)
        exMark.setScaler(0)
        let delay = 3


        gsap.to(choose, {sx: 1, sy: 1, sz: 1, ease: "back.out", delay: delay, duration: 0.5})
        gsap.to(your, {sx: 1, sy: 1, sz: 1, ease: "back.out", delay: delay + 0.1, duration: 0.5})
        gsap.to(hero, {sx: 1, sy: 1, sz: 1, ease: "back.out", delay: delay + 0.2, duration: 0.5})
        gsap.to( exMark, {sx: 1, sy: 1, sz: 1, ease: "back.out", delay: delay + 0.3, duration: 0.5})
        let graphicsDev = SceneHandler.getSceneObject("graphicsDev")
        let pirate = SceneHandler.getSceneObject("pirate")
        graphicsDev.setScaler(0)
        pirate.setScaler(0)
        gsap.to(pirate, {sx: 1, sy: 1, sz: 1, ease: "back.out", delay: delay + 0.7, duration: 0.5})
        gsap.to(graphicsDev, {sx: 1, sy: 1, sz: 1, ease: "back.out", delay: delay + 0.8, duration: 0.5})
    }
destroy() {
    super.destroy();
}

}
