import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";

import sceneHandler from "../../../data/SceneHandler.ts";


import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
import LevelHandler from "../LevelHandler.ts";
import {Vector3} from "@math.gl/core";
export default class CookieGame extends BaseLevel{

    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()



        SceneHandler.setScene("7949acae-4a94-406d").then(() => {

            LoadHandler.stopLoading()
        })

    }

    private configScene() {

        LoadHandler.onComplete =()=>{}

        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)

        this.levelObjects.gameCamera.setLockedView(new Vector3(-0,.5,0),new Vector3(-0.0-0.04,.6,1.6))


        let cookie = sceneHandler.getSceneObject("cookieBody")

        this.levelObjects.textBalloonHandler.setModel(cookie,[-0.1,0.35,0])
        this.levelObjects.textBalloonHandler.setText("Smash those assholes!")

    }
    update() {
        super.update();




    }
}
