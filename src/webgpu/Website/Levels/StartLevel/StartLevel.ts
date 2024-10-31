import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";

import {Vector3} from "@math.gl/core";
import Kris from "./Kris.ts";

export class StartLevel extends BaseLevel{

    private kris!:Kris;

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

        this.levelObjects.gameCamera.setLockedView(new Vector3(0,0.5,0),new Vector3(0,0.5,2))



    }
    update() {
        super.update();
        if(this.kris) this.kris.update()

    }
}
