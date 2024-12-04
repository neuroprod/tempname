
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";
import GameModel from "../../GameModel.ts";
import LevelHandler from "../LevelHandler.ts";



export class CookieLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;

    private cookie!: SceneObject3D;
    private tree!: SceneObject3D;



    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        SceneHandler.setScene("01811203-860d-45a3").then(() => {

            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });

            SceneHandler.addScene("58745956-acac-4aba").then(() => {
                LoadHandler.stopLoading()
            });
            SceneHandler.addScene("9f307f29-4140-48d6").then(() => {
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

        sceneHandler.getSceneObject("coinTree1").hide()
        sceneHandler.getSceneObject("coinTree2").hide()
        sceneHandler.getSceneObject("coinTree3").hide()
        sceneHandler.getSceneObject("cointree4").hide()
        sceneHandler.getSceneObject("topCoin").hide()
        this.tree = sceneHandler.getSceneObject("rootTree")
       // this.tree.setScaler(1.5)
        this.tree.z =-2
        this.tree.x =-1.5


        let char = sceneHandler.getSceneObject("charRoot")
        char.setScaler(1.2)


        this.cookie = sceneHandler.getSceneObject("cookieRoot")
        this.cookie.setScaler(1.5)
        this.cookie.z =-0.5
        this.cookie.x =8
        this.cookie.ry =-0.4

       GameModel.gameCamera.setMinMaxX(-0.3,100)



    }
    conversationDataCallBack(data:string){
        super.conversationDataCallBack(data);

    }
    resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){





            if(f.hitTriggerItem ==HitTrigger.COOKIE){
                f.triggerIsEnabled =false;

                let target = this.cookie.getWorldPos().add([-0.5,0.5,0])
                GameModel.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2.3]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.cookie.getWorldPos().add([-0.9,0,0]),1,()=>{
                    setTimeout(()=>{
                        if(GameModel.presentID==-1){
                            GameModel.conversationHandler.startConversation("cookieNoPresent")
                        }
                        else if(GameModel.presentID==0){
                            GameModel.conversationHandler.startConversation("cookieLightning")
                        }
                        else if(GameModel.presentID==1){
                            GameModel.conversationHandler.startConversation("cookieBox")
                        }
                        else if(GameModel.presentID==2){
                            GameModel.conversationHandler.startConversation("cookieNDA")
                        }
                        else if(GameModel.presentID==3){
                            GameModel.conversationHandler.startConversation("cookieHammer")
                        }
                   //     GameModel.conversationHandler.startConversation("cookie")

                        GameModel.conversationHandler.doneCallBack =()=>{

                            GameModel.conversationHandler.startConversation("cookie")

                            GameModel.conversationHandler.doneCallBack =()=> {

                                GameModel.gameCamera.setCharView()
                                setTimeout(() => {
                                    this.blockInput = false

                                    LevelHandler.setLevel("CookieGame")

                                }, 500)
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
