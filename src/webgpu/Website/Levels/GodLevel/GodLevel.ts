
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";
import God from "./God.ts";

export class GodLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;
    private strawBerry!: SceneObject3D;
    private cookie!: SceneObject3D;
    private tree!: SceneObject3D;
    private god!: SceneObject3D;
    private godController!: God;

    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
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

            SceneHandler.addScene("9f307f29-4140-48d6").then(() => {
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





       this.tree = sceneHandler.getSceneObject("rootTree")
        this.tree.setScaler(1.5)
        this.tree.z =-0.05
        this.tree.x =3


        this.god = sceneHandler.getSceneObject("godRoot")

        this.god.setScaler(1.5)

        this.god.ry =-0.3
        this.god.z =-0.5
        this.god.x =this.tree.x +1.3
this.godController =new God(this.god)


        this.cookie = sceneHandler.getSceneObject("cookieRoot")
        this.cookie.setScaler(1.5)
        this.cookie.z =-0.5
        this.cookie.x =-3

        this.strawBerry = sceneHandler.getSceneObject("strawberryRoot")
        this.strawBerry.setScaler(1.5)
        this.strawBerry.z =-0.5
        this.strawBerry.x =-5



       /* this.levelObjects.textBalloonHandler.setModel( cookie,[0.13,0.69])

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
*/

    }
    conversationDataCallBack(data:string){
        super.conversationDataCallBack(data);
        console.log(data)
    }
     resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){


            if(f.hitTriggerItem ==HitTrigger.GOD){


                f.triggerIsEnabled =false;
                let target =  f.getWorldPos().add([0.8,-0.2,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2.2]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.tree.getWorldPos(),1,()=>{
                    this.characterController.setAngle(0.6)
                    this.godController.show(()=>{

                        this.levelObjects.conversationHandler.startConversation("god")
                        this.levelObjects.conversationHandler.doneCallBack =()=>{
                            this.levelObjects.gameCamera.setCharView()
                            this.characterController.setAngle(0.0)
                           gsap.delayedCall(0.5,()=>{this.blockInput =false})

                        };
                    })

                });

            }

            if(f.hitTriggerItem ==HitTrigger.TREE){

                f.triggerIsEnabled =false;

                let target = this.tree.getWorldPos().add([-0.3,0.5,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,1.7]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.tree.getWorldPos().add([-0.6,0,0]),1,()=>{
                    this.characterController.setAngle(0.4)
                    gsap.delayedCall(0.5,()=>{
                        this.levelObjects.conversationHandler.startConversation("tree")
                        this.levelObjects.conversationHandler.doneCallBack =()=>{
                            this.levelObjects.gameCamera.setCharView()
                            this.characterController.setAngle(0.0)
                            gsap.delayedCall(0.5,()=>{this.blockInput =false})

                        }});

                });
                return true;
            }



            if(f.hitTriggerItem ==HitTrigger.STRAWBERRY){
                f.triggerIsEnabled =false;

                let target = this.strawBerry.getWorldPos().add([0.5,0.5,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2]))
               this.blockInput =true

               this.characterController.gotoAndIdle(this.strawBerry.getWorldPos().add([0.9,0,0]),-1,()=>{
                   setTimeout(()=>{
                   this.levelObjects.conversationHandler.startConversation("strawberry")
                   this.levelObjects.conversationHandler.doneCallBack =()=>{
                       this.levelObjects.gameCamera.setCharView()
                       setTimeout(()=>{this.blockInput =false},500)

                   }},1500);

               });
                return true;
            }
            if(f.hitTriggerItem ==HitTrigger.COOKIE){
                f.triggerIsEnabled =false;

                let target = this.cookie.getWorldPos().add([0.5,0.5,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.cookie.getWorldPos().add([0.9,0,0]),-1,()=>{
                    setTimeout(()=>{
                        this.levelObjects.conversationHandler.startConversation("cookie")
                        this.levelObjects.conversationHandler.doneCallBack =()=>{
                            this.levelObjects.gameCamera.setCharView()
                            setTimeout(()=>{this.blockInput =false},500)

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
