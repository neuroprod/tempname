
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";


import Strawberry from "./Strawberry.ts";
import GameModel from "../../GameModel.ts";



export class StrawberryLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;

    private strawBerry!: SceneObject3D;

    strawBerryHandler =new Strawberry()


    init() {
        super.init();


        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()

        SceneHandler.setScene("bbd954c4-d38e-4618").then(() => {

            SceneHandler.addScene("1234").then(() => {
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
        this.blockInput =false
        this.characterController.setCharacter()
        GameModel.gameCamera.setCharacter()
        GameModel.gameRenderer.setModels(SceneHandler.allModels)

        this.strawBerryHandler.init()







        this.strawBerry = sceneHandler.getSceneObject("strawberryRoot")
        this.strawBerry.setScaler(1.3)
        this.strawBerry.z =0
        this.strawBerry.x =4
        this.strawBerry.ry =-0.4

        GameModel.gameCamera.setMinMaxX(-0.3,100)



    }
    update(){
        super.update()

        this.strawBerryHandler.update()
    }
    conversationDataCallBack(data:string){
        super.conversationDataCallBack(data);

    }
    resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){





            if(f.hitTriggerItem ==HitTrigger.STRAWBERRY){
                f.triggerIsEnabled =false;

                let target = this.strawBerry.getWorldPos().add([-0.5,0.5,0])
                GameModel.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2.3]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.strawBerry.getWorldPos().add([-0.9,0,0]),1,()=>{
                    setTimeout(()=>{

                            GameModel.conversationHandler.startConversation("strawBerry")

                        //     GameModel.conversationHandler.startConversation("cookie")

                        GameModel.conversationHandler.doneCallBack =()=>{
                            GameModel.conversationHandler
                         //   GameModel.conversationHandler.startConversation("cookie")

                            GameModel.conversationHandler.doneCallBack =()=> {


                            }
                        }},1500);

                });
                return true;
            }

        }

        return false;
    }


    destroy(){
        this.strawBerryHandler.destroy()
        super.destroy()
        if(this.tl) this.tl.clear()

    }
}
