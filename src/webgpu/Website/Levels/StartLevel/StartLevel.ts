import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";

import {Vector3} from "@math.gl/core";
import Kris from "./Kris.ts";
import Intro from "./Intro.ts";
import gsap from "gsap";

export class StartLevel extends BaseLevel{

    private kris!:Kris;
    private intro!: Intro;

    init() {
        super.init();
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
        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)


        if(!this.kris) this.kris=new Kris()
        this.kris.reset()

        let char = sceneHandler.getSceneObject("charRoot")

        char.x = -0.5;
        let startHeight =3
        this.levelObjects.gameCamera.setLockedView(new Vector3(0,startHeight,3),new Vector3(0,startHeight-0.2,2+3))

        if(!this.intro) this.intro=new Intro()
        this.intro.start()

    }
    update() {
        super.update();
        if(this.kris) this.kris.update()
        if(this.intro) this.intro.update()

        if(this.intro.done && this.levelObjects.keyInput.getJump()){
            this.intro.done =false;
            console.log("move")
            this.moveToStartPos();
        }


    }

    private moveToStartPos() {
        let tl =gsap.timeline()

        tl.to(   this.levelObjects.gameCamera.cameraLookAt,{y:0.5,duration:1,ease:"power4.Out"},0)
        tl.to(   this.levelObjects.gameCamera.cameraWorld,{y:0.5,duration:1,ease:"power4.Out"},0)
        tl.to(   this.levelObjects.gameCamera.cameraLookAt,{z:0.0,duration:2,ease:"power2.Out"},0)
        tl.to(   this.levelObjects.gameCamera.cameraWorld,{z:2,duration:2,ease:"power2.Out"},0)
    }
}
