import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";


import {Vector3} from "@math.gl/core";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
import SoundHandler from "../../SoundHandler.ts";
import LevelHandler from "../LevelHandler.ts";
import GameModel from "../GameModel.ts";

class StrawberryData {
    strawBerry: SceneObject3D;
    hamer: SceneObject3D;
    splash: SceneObject3D;
    isHitting = false;
    private sbTopPos: Vector3;
    private sbBottomPos: Vector3;
    private tl2!: gsap.core.Timeline;
    private tl!: gsap.core.Timeline;
    private hamerY: number = 0;

    constructor(index: number) {

        this.strawBerry = sceneHandler.getSceneObject("strawberry" + index)
        this.sbTopPos = this.strawBerry.getPosition().clone()
        this.sbTopPos.y = 0.24
        this.sbTopPos.z = 0.1
        this.sbBottomPos = this.sbTopPos.clone();

        this.sbBottomPos.y -= 0.34
        this.sbBottomPos.z -= 0.1
        this.strawBerry.setPositionV(this.sbBottomPos)
        this.hamer = sceneHandler.getSceneObject("hamer" + index)
        this.hamerY = this.hamer.y;
        this.hamer.hide()
        this.splash = sceneHandler.getSceneObject("splash" + index)
        this.splash.hide()
    }

    destroy() {

        if (this.tl2) this.tl2.clear()
        if (this.tl) this.tl.clear()
        this.strawBerry.setPositionV(this.sbTopPos)
        this.hamer.y = this.hamerY;
    }

    show() {
        if (this.isHitting) return;
        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline();
        this.tl.to(this.strawBerry, {
            x: this.sbTopPos.x,
            y: this.sbTopPos.y,
            z: this.sbTopPos.z,
            duration: 0.3,
            ease: "back.out"
        })
        this.tl.to(this.strawBerry, {
            x: this.sbBottomPos.x,
            y: this.sbBottomPos.y,
            z: this.sbBottomPos.z,
            duration: 0.2,
            ease: "power2.in"
        }, 0.3 + Math.random() * 0.3)
    }

    hitHole() {


        if (this.tl2) this.tl2.clear()
        this.isHitting = true;
        this.tl2 = gsap.timeline();
        let hit = false;
        if (this.strawBerry.y > this.sbBottomPos.y + 0.001) {
            hit = true;

        }

        SoundHandler.playWetHit(hit)
        this.hamer.show()
        this.hamer.y = this.hamerY + 0.5
        this.tl2.to(this.hamer, {y: this.hamerY, duration: 0.1})
        if (hit) {
            this.tl2.call(() => {
                this.tl.clear()
                this.strawBerry.setPositionV(this.sbBottomPos)
                this.splash.show()
            }, [], 0.1);
            this.tl2.call(() => {

                this.splash.hide()
            }, [], 0.4);
        }
        this.tl2.to(this.hamer, {y: this.hamerY + 1, duration: 0.1}, 0.4)
        this.tl2.call(() => {
            this.hamer.hide()
            this.isHitting = false

        }, [], 0.5)
        this.strawBerry.setPositionV(this.sbBottomPos)
        return hit
    }
}

export default class CookieGame extends BaseLevel {

    public nextStrawBerryTime = 2;
    private strawBerryData: Array<StrawberryData> = []
    private currentStrawBerry: number = -1;
    private hole0prev = false;
    private hole1prev = false;
    private hole2prev = false;
    private points = 0;


    private hitCount = 0;
    private playGame: boolean = true;

    init() {
        super.init();
        LoadHandler.onComplete = this.configScene.bind(this)
        LoadHandler.startLoading()


        SceneHandler.setScene("7949acae-4a94-406d").then(() => {

            LoadHandler.stopLoading()
        })

    }

    update() {
        super.update();
        if (this.playGame) {
            this.nextStrawBerryTime -= Timer.delta;
            if (this.nextStrawBerryTime < 0) {
                this.currentStrawBerry = Math.floor(Math.random() * 3);

                this.strawBerryData[this.currentStrawBerry].show()
                this.nextStrawBerryTime = 1.5 + Math.random() * 1.5;
            }

            let jump = GameModel.keyInput.getJump()
            let hInput = GameModel.keyInput.getHdir()
            if (GameModel.gamepadInput.connected) {

                if (hInput == 0) hInput = GameModel.gamepadInput.getHdir()

                if (!jump) jump =GameModel.gamepadInput.getJump()
            }
            this.setHole(hInput == -1, jump, hInput == 1)
        }

    }

    public setHole(hole0: boolean, hole1: boolean, hole2: boolean) {
        if (hole0 != this.hole0prev) {
            if (hole0) this.hitHole(0)
            this.hole0prev = hole0
        }
        if (hole1 != this.hole1prev) {
            if (hole1) this.hitHole(1)
            this.hole1prev = hole1
        }
        if (hole2 != this.hole2prev) {
            if (hole2) this.hitHole(2)
            this.hole2prev = hole2
        }

    }

    public hitHole(index: number) {
        for (let sbD of this.strawBerryData) {
            if (sbD.isHitting) return;

        }
        let text = ""
        if (this.strawBerryData[index].hitHole()) {
           GameModel.gameCamera.screenShakeCookie(0.1)
            this.points++;
            if(this.points==1){
                text ="First one is the sweetest!"
            }else{
                text ="Yea! " + this.points + " kills!"
            }


           // this.hat.y = this.hatY + 0.05
           // gsap.to(this.hat, {y: this.hatY, ease: 'power4.in', delay: 0.1, duration: 0.4})

        } else {
           GameModel.gameCamera.screenShakeCookie(0.01)
            text ="Ow, you missed."
        }
        this.hitCount++;


        if (this.points > 1 && this.hitCount > 8) {
            this.endGame()
            return;
        }
       GameModel.textBalloonHandler.setText(text)
    }

    destroy() {
        super.destroy();
        for (let sbD of this.strawBerryData) {
            sbD.destroy()
        }

        this.strawBerryData = []
    }

    configScene() {

        LoadHandler.onComplete = () => {
        }

       GameModel.gameRenderer.setModels(SceneHandler.allModels)


       GameModel.gameCamera.setLockedView(new Vector3(-0, .5, 0), new Vector3(-0.0 - 0.04, .6, 1.6))

        let cookie = sceneHandler.getSceneObject("cookieBody")

       GameModel.textBalloonHandler.setModel(cookie, [-0.1, 0.35, 0])
       GameModel.textBalloonHandler.setText("Smash those bastards!")
        this.strawBerryData = []
        for (let i = 0; i < 3; i++) {
            let sbData = new StrawberryData(i)
            this.strawBerryData.push(sbData);
        }
        this.points = 0;
        this.playGame =true
        this.nextStrawBerryTime =2;
        this.hitCount=0;
    }

    private endGame() {
       GameModel.textBalloonHandler.setText("Great job! That will teach them!")
        this.playGame = false
        gsap.delayedCall(4,()=>{LevelHandler.setLevel("StrawBerry")})

    }


}
