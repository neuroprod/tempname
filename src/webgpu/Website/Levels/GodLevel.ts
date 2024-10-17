
import {PlatformLevel} from "./PlatformLevel.ts";
import LoadHandler from "../../data/LoadHandler.ts";
import SceneHandler from "../../data/SceneHandler.ts";
import sceneHandler from "../../data/SceneHandler.ts";
import FontMesh from "../../modelMaker/FontMesh.ts";
import Font from "../../data/Font.ts";

export class GodLevel extends PlatformLevel{

    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        SceneHandler.setScene("e857a11e-d9f9-4a0c").then(() => {

            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });

                this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
                this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)

            LoadHandler.stopLoading()
        })

    }
    private configScene() {

        LoadHandler.onComplete =()=>{}

        this.characterController.setCharacter()
        this.levelObjects.gameCamera.setCharacter()
        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)


       /* let char = sceneHandler.getSceneObject("charRoot")
        console.log(char,"??")*/


    }
}
