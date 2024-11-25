
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";
import LevelData from "../LevelData.ts";
import LevelHandler from "../LevelHandler.ts";



export class StrawberryLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;

    private strawBerry!: SceneObject3D;




    init() {
        super.init();

        console.log("strawberryInit")
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
        this.levelObjects.gameCamera.setCharacter()
        this.levelObjects.gameRenderer.setModels(SceneHandler.allModels)








        this.strawBerry = sceneHandler.getSceneObject("strawberryRoot")
        this.strawBerry.setScaler(1.3)
        this.strawBerry.z =-0.3
        this.strawBerry.x =2
        this.strawBerry.ry =-0.4

        this.levelObjects.gameCamera.setMinMaxX(-0.3,100)

console.log("strawberrySetup")

    }
    conversationDataCallBack(data:string){
        super.conversationDataCallBack(data);

    }
    resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){





            if(f.hitTriggerItem ==HitTrigger.STRAWBERRY){
                f.triggerIsEnabled =false;

                let target = this.strawBerry.getWorldPos().add([-0.5,0.5,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2.3]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.strawBerry.getWorldPos().add([-0.9,0,0]),1,()=>{
                    setTimeout(()=>{

                            this.levelObjects.conversationHandler.startConversation("strawBerry")

                        //     this.levelObjects.conversationHandler.startConversation("cookie")

                        this.levelObjects.conversationHandler.doneCallBack =()=>{
                            this.levelObjects.conversationHandler
                         //   this.levelObjects.conversationHandler.startConversation("cookie")

                            this.levelObjects.conversationHandler.doneCallBack =()=> {


                            }
                        }},1500);

                });
                return true;
            }

        }

        return false;
    }


    destroy(){
        super.destroy()
        if(this.tl) this.tl.clear()

    }
}
