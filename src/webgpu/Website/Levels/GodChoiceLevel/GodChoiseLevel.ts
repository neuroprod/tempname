import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";

import sceneHandler from "../../../data/SceneHandler.ts";

import {Vector3} from "@math.gl/core";

import SceneObject3D from "../../../data/SceneObject3D.ts";

export default class GodChoiceLevel extends BaseLevel{
    private god!: SceneObject3D;

    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()



        SceneHandler.setScene("5d87e394-0d20-43f1").then(() => {
            SceneHandler.addScene("0c10748d-698e-4393").then(() => {
                LoadHandler.stopLoading()
            });

            LoadHandler.stopLoading()
        })

    }

    private configScene() {

        LoadHandler.onComplete =()=>{}

        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)

        this.god = sceneHandler.getSceneObject("godRoot")
        sceneHandler.getSceneObject("godLightning").hide()
        sceneHandler.getSceneObject("godNDA").hide()
        sceneHandler.getSceneObject("godCloud").hide()
        sceneHandler.getSceneObject("godPresent").hide()
        sceneHandler.getSceneObject("godLightning").hide()
        sceneHandler.getSceneObject("godHamer").hide()


        let holder = sceneHandler.getSceneObject("godHolder")
        holder.addChild(this.god)
        this.levelObjects.textBalloonHandler.setModel(this.god,[0.1,0.6,0])
        this.levelObjects.textBalloonHandler.setText("Ow boy, How exiting!")
        this.levelObjects.gameCamera.setLockedView(new Vector3(0,.32,0),new Vector3(0,.32,2))
    }
    update() {
        super.update();
    }
}
