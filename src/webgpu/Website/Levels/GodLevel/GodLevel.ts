
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
import GameModel from "../../GameModel.ts";

export class GodLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;

    private tree!: SceneObject3D;
    private god!: SceneObject3D;
    private godController!: God;
    private skipGodChoice: boolean =false;
private startPos =-10
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
        GameModel.gameCamera.setCharacter()

        GameModel.gameRenderer.setModels(SceneHandler.allModels)
        GameModel.gameRenderer.addModel(this.characterController.cloudParticles.particlesModel)




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
        charRoot.x =this.startPos-2
        charRoot.y = 0.15
        this.characterController.setCharacter()
        this.characterController.gotoAndIdle(new Vector3(this.startPos, 0.1, 0), 1, () => {
            this.blockInput =false

        })
        GameModel.gameCamera.camDistance =2;
        GameModel.gameCamera.heightOffset =0.5
        GameModel.gameCamera.setMinMaxX(this.startPos,4.5)


        GameModel.gameCamera.setForCharPos(new Vector3(this.startPos, 0, 0))



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
                GameModel.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.tree.getWorldPos(),1,()=>{
                    this.characterController.setAngle(0.6)
                    this.godController.show(()=>{

                        GameModel.conversationHandler.startConversation("god")
                        GameModel.conversationHandler.doneCallBack =()=>{

                           gsap.delayedCall(0.5,()=>{

                               if( this.skipGodChoice){
                                   gsap.delayedCall(4,()=>{
                                   LevelHandler.setLevel("Cookie")})
                                   GameModel.coinHandeler.show()
                                   GameModel.coinHandeler.addCoins(5)

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

                let target = this.tree.getWorldPos().add([-0.5,0.55,0])
                GameModel.gameCamera.TweenToLockedView( target,target.clone().add([0,0,1.7]))
                this.blockInput =true

                this.characterController.gotoAndIdle(this.tree.getWorldPos().add([-0.65,0,0]),1,()=>{
                    this.characterController.setAngle(0.4)
                    gsap.delayedCall(0.5,()=>{
                        GameModel.conversationHandler.startConversation("tree")
                        GameModel.conversationHandler.doneCallBack =()=>{
                            GameModel.gameCamera.setCharView()
                            GameModel.gameCamera.camDistance =2.5;
                            GameModel.gameCamera.heightOffset =0.7
                            this.characterController.setAngle(0.0)
                            gsap.delayedCall(0.5,()=>{this.blockInput =false})

                        }});

                });
                return true;
            }



          /*  if(f.hitTriggerItem ==HitTrigger.STRAWBERRY){
                f.triggerIsEnabled =false;

                let target = this.strawBerry.getWorldPos().add([0.5,0.5,0])
                GameModel.gameCamera.TweenToLockedView( target,target.clone().add([0,0,2]))
               this.blockInput =true

               this.characterController.gotoAndIdle(this.strawBerry.getWorldPos().add([0.9,0,0]),-1,()=>{
                   setTimeout(()=>{
                   GameModel.conversationHandler.startConversation("strawberry")
                   GameModel.conversationHandler.doneCallBack =()=>{
                       GameModel.gameCamera.setCharView()
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
