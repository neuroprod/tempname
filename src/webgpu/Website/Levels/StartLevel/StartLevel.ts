import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";

import {Vector3} from "@math.gl/core";
import Kris from "./Kris.ts";
import Intro from "./Intro.ts";
import gsap from "gsap";
import Bezier from "../../../lib/path/Bezier.ts";
import CharacterController from "../../CharacterController.ts";
import Timer from "../../../lib/Timer.ts";
import MouseInteractionWrapper from "../../MouseInteractionWrapper.ts";
import LevelHandler from "../LevelHandler.ts";

export class StartLevel extends BaseLevel{

    private kris!:Kris;
    private intro!: Intro;
    private bezierCamera!: Bezier;
    private bezierTarget!: Bezier;
    private camPos =new Vector3()
    private camTarget =new Vector3()
    private bezierTime =0;
    private characterController!: CharacterController;

    init() {
        super.init();
        this.characterController = new CharacterController(this.levelObjects.renderer)
        LoadHandler.onComplete =this.configScene.bind(this)
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

    private configScene() {

        LoadHandler.onComplete =()=>{}

        this.levelObjects.gameRenderer.setModels(SceneHandler.allModels)
        this.levelObjects.gameRenderer.setLevelType("platform")
        this.setMouseHitObjects( SceneHandler.mouseHitModels);



        if(!this.kris) this.kris=new Kris()
        this.kris.reset()

        let char = sceneHandler.getSceneObject("charRoot")
        char.x = -2;
        char.y = 1;
        this.characterController.setCharacter()

        this.camPos.set(0,0.7,2)
        this.camTarget.set(0,0.7,0)
        this.levelObjects.gameCamera.setLockedView(this.camTarget.add([0,0,0]),this.camPos.clone().add([0,0,1]))
        this.levelObjects.gameCamera.TweenToLockedView(this.camTarget,this.camPos,3)
        if(!this.intro) this.intro=new Intro()
        this.intro.start()


        let kris = this.mouseInteractionMap.get("kris") as MouseInteractionWrapper
        kris.onClick=()=>{
           this.kris.jump()
            gsap.delayedCall(1.5,()=>{LevelHandler.setLevel("Website")})
          // LevelHandler.setLevel("Website")
        }
        let mainChar = this.mouseInteractionMap.get("mainChar") as MouseInteractionWrapper
        mainChar.onClick=()=>{
            LevelHandler.setLevel("God")
        }
        this.kris.show();
        this.characterController.gotoAndIdle(new Vector3(0,0.1,0),1,()=>{})
    }
    update() {
        super.update();
        if(this.kris) this.kris.update()
        if(this.intro) this.intro.update()
      this.characterController.updateIdle(Timer.delta)
        /*if(this.intro.done && this.levelObjects.keyInput.getJump()){
            this.intro.done =false;
            console.log("move")
            this.moveToStartPos();
        }*/


    }

    private moveToStartPos() {
        this.bezierTime =0
        let tl =gsap.timeline({onUpdate:()=>{
                this.bezierCamera.getTime(this.camPos,this.bezierTime)
                this.bezierTarget.getTime(this.camTarget,this.bezierTime)
                this.levelObjects.gameCamera.setLockedView(this.camTarget,this.camPos)
            }})

       tl.to(   this,{ bezierTime:1,duration:3,ease:"power3.InOut"},0)

    }
}
