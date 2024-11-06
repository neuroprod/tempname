
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";

export class GodLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;

    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
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
            SceneHandler.addScene("c7dc8752-9088-476b").then(() => {
                LoadHandler.stopLoading()
            });
            LoadHandler.stopLoading()
        })

    }
    configScene() {
        super.configScene()
        LoadHandler.onComplete =()=>{}

        this.characterController.setCharacter()
        this.levelObjects.gameCamera.setCharacter()
        SceneHandler.usedModels.push(this.characterController.cloudParticles.particlesModel)
        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)


       let god = sceneHandler.getSceneObject("godRoot")
        god.setScaler(1.5)
       god.y =0.8
        god.ry =-0.5
        god.z =-0.5
        god.x =2.5
        let cookie = sceneHandler.getSceneObject("cookieRoot")
        cookie.setScaler(1.5)
        cookie.z =-0.5
        cookie.x =-2

        let strawBerry = sceneHandler.getSceneObject("strawberryRoot")
        strawBerry.setScaler(1.5)
        strawBerry.z =-0.5
        strawBerry.x =-4


        this.levelObjects.textBalloonHandler.setModel( cookie,[0.13,0.69])

        this.tl = gsap.timeline({repeat:-1})
        this.tl.call(()=>{
            this.levelObjects.textBalloonHandler.setText("My mom told me\nI was a happy baby.")
        },[],3)
        this.tl.call(()=>{
            this.levelObjects.textBalloonHandler.setText("But then I had to go to\nschool and stuff")
        },[],6)
        this.tl.call(()=>{
            this.levelObjects.textBalloonHandler.setText("Now I just want to smash things.")
        },[],9)
        this.tl.call(()=>{
            this.levelObjects.textBalloonHandler.hideText()
        },[],12)


    }
    destroy(){
        super.destroy()
        if(this.tl) this.tl.clear()

    }
}
