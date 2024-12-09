
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";



import GameModel from "../../GameModel.ts";
import LevelHandler from "../LevelHandler.ts";



export class HandLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;
    private hand!: SceneObject3D;






    init() {
        super.init();


        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()


        SceneHandler.setScene("2de5b0dc-f37a-4e59").then(() => {

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
        this.characterController.setCharacter()
        GameModel.gameCamera.setCharacter()
        GameModel.gameRenderer.setModels(SceneHandler.allModels)
        GameModel.gameRenderer.addModel(this.characterController.cloudParticles.particlesModel)




        let char = sceneHandler.getSceneObject("charRoot")
        char.setScaler(1.2)
        char.x = 0

this.hand =   sceneHandler.getSceneObject("rootHand")


        GameModel.gameCamera.setMinMaxX(-0.3,100)



    }
    update(){
        super.update()


    }
    conversationDataCallBack(data:string){
        super.conversationDataCallBack(data);


    }
    resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){





            if(f.hitTriggerItem ==HitTrigger.HAND){
                f.triggerIsEnabled =false;

                let target = this.hand.getWorldPos().add([-0.5,0.5,0])
                GameModel.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2.3]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.hand.getWorldPos().add([-0.9,0,0]),1,()=>{
                    gsap.delayedCall(0.5,()=>{
                     GameModel.conversationHandler.startConversation("hand")

                        GameModel.conversationHandler.doneCallBack =()=>{
LevelHandler.setLevel("Dock");
                        }});

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
