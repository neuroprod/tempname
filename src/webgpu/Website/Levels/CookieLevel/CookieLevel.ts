
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";
import LevelData from "../LevelData.ts";
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
        this.levelObjects.gameCamera.setCharacter()
        this.levelObjects.gameRenderer.setModels(SceneHandler.allModels)


        sceneHandler.getSceneObject("coinTree1").hide()
        sceneHandler.getSceneObject("coinTree2").hide()
        sceneHandler.getSceneObject("coinTree3").hide()
        sceneHandler.getSceneObject("cointree4").hide()
        sceneHandler.getSceneObject("topCoin").hide()
        this.tree = sceneHandler.getSceneObject("rootTree")
       // this.tree.setScaler(1.5)
        this.tree.z =-2
        this.tree.x =-1.5





        this.cookie = sceneHandler.getSceneObject("cookieRoot")
        this.cookie.setScaler(1.5)
        this.cookie.z =-0.5
        this.cookie.x =8
        this.cookie.ry =-0.4

        this.levelObjects.gameCamera.setMinMaxX(-0.3,100)



    }
    conversationDataCallBack(data:string){
        super.conversationDataCallBack(data);

    }
    resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){





            if(f.hitTriggerItem ==HitTrigger.COOKIE){
                f.triggerIsEnabled =false;

                let target = this.cookie.getWorldPos().add([-0.5,0.5,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2.3]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.cookie.getWorldPos().add([-0.9,0,0]),1,()=>{
                    setTimeout(()=>{
                        if(this.levelObjects.presentID==-1){
                            this.levelObjects.conversationHandler.startConversation("cookieNoPresent")
                        }
                        else if(this.levelObjects.presentID==0){
                            this.levelObjects.conversationHandler.startConversation("cookieLightning")
                        }
                        else if(this.levelObjects.presentID==1){
                            this.levelObjects.conversationHandler.startConversation("cookieBox")
                        }
                        else if(this.levelObjects.presentID==2){
                            this.levelObjects.conversationHandler.startConversation("cookieNDA")
                        }
                        else if(this.levelObjects.presentID==3){
                            this.levelObjects.conversationHandler.startConversation("cookieHammer")
                        }
                   //     this.levelObjects.conversationHandler.startConversation("cookie")

                        this.levelObjects.conversationHandler.doneCallBack =()=>{

                            this.levelObjects.conversationHandler.startConversation("cookie")

                            this.levelObjects.conversationHandler.doneCallBack =()=> {

                                this.levelObjects.gameCamera.setCharView()
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
