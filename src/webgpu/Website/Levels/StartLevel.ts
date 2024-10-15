import {BaseLevel} from "./BaseLevel.ts";
import LoadHandler from "../../data/LoadHandler.ts";
import SceneHandler from "../../data/SceneHandler.ts";
import sceneHandler from "../../data/SceneHandler.ts";
import FontMesh from "../../modelMaker/FontMesh.ts";
import Font from "../../data/Font.ts";

export class StartLevel extends BaseLevel{



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

        let me = sceneHandler.getSceneObject("headTop")
        me.setScaler(1.3)
        me.x = 0.5;

        let char = sceneHandler.getSceneObject("charRoot")
        console.log(char,"??")
        char.x = -0.5;

        let s =sceneHandler.getSceneObject("titleHolder").model?.mesh as FontMesh
        s.setText(" ",new Font())
    }
}
