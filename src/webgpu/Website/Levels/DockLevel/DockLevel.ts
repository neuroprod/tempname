
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";

import GameModel from "../../GameModel.ts";
import Sea from "./Sea.ts";



export class DockLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;
    private sea!: Sea;





    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()

        SceneHandler.setScene("f05cd0d2-c8f3-4ad4").then(() => {

            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });




            LoadHandler.stopLoading()
        })

    }
    configScene() {
        super.configScene()
        LoadHandler.onComplete =()=>{}
        this.blockInput =false
        let char = sceneHandler.getSceneObject("charRoot")
        char.x = -4;
        char.y = 1;

        this.characterController.setCharacter()
        GameModel.gameCamera.setCharacter()
        GameModel.gameRenderer.setModels(SceneHandler.allModels)
        GameModel.gameRenderer.addModel(this.characterController.cloudParticles.particlesModel)

        this.sea =new Sea(GameModel.renderer)
        GameModel.gameRenderer.addModel(this.sea.seaModel)

        GameModel.gameCamera.camDistance =2;
        GameModel.gameCamera.heightOffset =0.5








        GameModel.gameCamera.setMinMaxX(-3,100)



    }
    conversationDataCallBack(data:string){
        super.conversationDataCallBack(data);

    }
    resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){




        }

        return false;
    }

    update() {
        super.update();
        this.sea.update()
    }

    destroy(){
        super.destroy()
        if(this.tl) this.tl.clear()

    }
}
