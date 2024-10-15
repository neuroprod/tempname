import {BaseLevel} from "./BaseLevel.ts";
import LoadHandler from "../../data/LoadHandler.ts";
import SceneHandler from "../../data/SceneHandler.ts";
import sceneHandler from "../../data/SceneHandler.ts";
import FontMesh from "../../modelMaker/FontMesh.ts";
import Font from "../../data/Font.ts";

export class StartLevel extends BaseLevel{



    init() {
        super.init();

        LoadHandler.startLoading()
        LoadHandler.startLoading()
        SceneHandler.setScene("456").then(() => {

            SceneHandler.addScene("1234").then(() => {

                this.configScene()
                this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
                this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)
                LoadHandler.stopLoading()
            });
            LoadHandler.stopLoading()
        })

    }

    private configScene() {
        let s =sceneHandler.getSceneObject("titleHolder").model?.mesh as FontMesh
        s.setText("hello ik ben eenT",new Font())
    }
}
