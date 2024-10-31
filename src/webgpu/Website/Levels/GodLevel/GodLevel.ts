
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";


export class GodLevel extends PlatformLevel{

    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        SceneHandler.setScene("e857a11e-d9f9-4a0c").then(() => {

            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });

            SceneHandler.addScene("0c10748d-698e-4393").then(() => {
                LoadHandler.stopLoading()
            });
            SceneHandler.addScene("58745956-acac-4aba").then(() => {
                LoadHandler.stopLoading()
            });
            LoadHandler.stopLoading()
        })

    }
    private configScene() {

        LoadHandler.onComplete =()=>{}

        this.characterController.setCharacter()
        this.levelObjects.gameCamera.setCharacter()
        SceneHandler.usedModels.push(this.characterController.cloudParticles.particlesModel)
        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)


       let god = sceneHandler.getSceneObject("godRoot")
        god.setScaler(1.5)
        //god.ry =-0.2
        god.z =-0.5

        let cookie = sceneHandler.getSceneObject("cookieRoot")
        cookie.setScaler(1.5)
       // cookie.ry =-0.2
        cookie.z =-0.5
        cookie.x =-2
        this.levelObjects.textBalloonHandler.setModel( cookie,[0.13,0.69])
        this.levelObjects.textBalloonHandler.setText("My mom told me\nI was a happy baby.")

    }
}
