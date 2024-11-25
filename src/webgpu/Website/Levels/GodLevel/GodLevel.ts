
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";
import God from "./God.ts";
import LevelHandler from "../LevelHandler.ts";
import {Vector3} from "@math.gl/core";

export class GodLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;

    private tree!: SceneObject3D;
    private god!: SceneObject3D;
    private godController!: God;
    private skipGodChoice: boolean =false;

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
        this.skipGodChoice =false
        this.levelObjects.gameCamera.setCharacter()
        this.levelObjects.gameRenderer.setModels(SceneHandler.allModels)





       this.tree = sceneHandler.getSceneObject("rootTree")
        this.tree.setScaler(1.5)
        this.tree.z =-0.05
        this.tree.x =3


        this.god = sceneHandler.getSceneObject("godRoot")

        this.god.setScaler(1.5)

        this.god.ry =-0.3
        this.god.z =-0.5
        this.god.x =this.tree.x +1.3

        this.godController =new God()
        this.godController.init(this.god)




        this.blockInput =true

       let charRoot = SceneHandler.getSceneObject("charRoot");
        charRoot.x = -5
        charRoot.y = 0.15
        this.characterController.setCharacter()
        this.characterController.gotoAndIdle(new Vector3(-3, 0.1, 0), 1, () => {
            this.blockInput =false

        })
        this.levelObjects.gameCamera.camDistance =2;
        this.levelObjects.gameCamera.heightOffset =0.5
        this.levelObjects.gameCamera.setMinMaxX(-3,4.5)

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
        if(data=="godNo"){
            this.skipGodChoice =true;
        }
    }
     resolveHitTrigger(f: SceneObject3D) {
        if(!super.resolveHitTrigger(f)){


            if(f.hitTriggerItem ==HitTrigger.GOD){


                f.triggerIsEnabled =false;
                let target =  f.getWorldPos().add([1,-0.1,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.tree.getWorldPos(),1,()=>{
                    this.characterController.setAngle(0.6)
                    this.godController.show(()=>{

                        this.levelObjects.conversationHandler.startConversation("god")
                        this.levelObjects.conversationHandler.doneCallBack =()=>{

                           gsap.delayedCall(0.5,()=>{

                               if( this.skipGodChoice){
                                   LevelHandler.setLevel("Cookie")

                               }
                                    else{
                                   LevelHandler.setLevel("GodChoice")
                                    }

                           })

                        };
                    })

                });

            }

            if(f.hitTriggerItem ==HitTrigger.TREE){

                f.triggerIsEnabled =false;

                let target = this.tree.getWorldPos().add([-0.3,0.5,0])
                this.levelObjects.gameCamera.TweenToLockedView( target,target.clone().add([0,0,1.7]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.tree.getWorldPos().add([-0.65,0,0]),1,()=>{
                    this.characterController.setAngle(0.4)
                    gsap.delayedCall(0.5,()=>{
                        this.levelObjects.conversationHandler.startConversation("tree")
                        this.levelObjects.conversationHandler.doneCallBack =()=>{
                            this.levelObjects.gameCamera.setCharView()
                            this.levelObjects.gameCamera.camDistance =2.5;
                            this.levelObjects.gameCamera.heightOffset =0.7
                            this.characterController.setAngle(0.0)
                            gsap.delayedCall(0.5,()=>{this.blockInput =false})

                        }});

                });
                return true;
            }



          /*  if(f.hitTriggerItem ==HitTrigger.STRAWBERRY){
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
            }*/


        }

        return false;
    }
update(){
        super.update()
    this.godController.update()
}

    destroy(){
        super.destroy()
        this.godController.destroy()
        if(this.tl) this.tl.clear()

    }
}
