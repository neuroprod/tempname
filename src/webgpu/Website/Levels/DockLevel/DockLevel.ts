
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";

import GameModel from "../../GameModel.ts";
import Sea from "./Sea.ts";
import Timer from "../../../lib/Timer.ts";
import {HitTrigger} from "../../../data/HitTriggers.ts";
import {Vector3} from "@math.gl/core";
import LevelHandler from "../LevelHandler.ts";



export class DockLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;
    private sea!: Sea;
    private rootShip!: SceneObject3D;
    private landlord!: SceneObject3D;






    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        SceneHandler.setScene("f05cd0d2-c8f3-4ad4").then(() => {


            SceneHandler.addScene("edb3050b-b132-4957").then(() => {
                LoadHandler.stopLoading()
            });

            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });
            SceneHandler.addScene("697e1443-b2d5-4871").then(() => {
                LoadHandler.stopLoading()
            });



            LoadHandler.stopLoading()
        })

    }
    configScene() {
        super.configScene()
        LoadHandler.onComplete =()=>{}
        this.blockInput =false
        let foam = sceneHandler.getSceneObject("foamHolder")
        for (let s of foam.children){
            ( s as SceneObject3D).hide()
        }

        this.rootShip = sceneHandler.getSceneObject("rootShip")
        this.rootShip.x =1
        this.rootShip.z =-0.7
        let char = sceneHandler.getSceneObject("charRoot")
        char.x = -4;
        char.y = 1;
        char.setScaler(1.2)

        this.landlord = sceneHandler.getSceneObject("rootLandlord")
        this.landlord.setScaler(1.2)
        this.landlord.x =4.5
        this.landlord.y =-1000
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



                if(f.hitTriggerItem ==HitTrigger.DOCK) {

                    f.triggerIsEnabled=false
                    let target =new Vector3(5.8, 0,0)
                    GameModel.gameCamera.TweenToLockedView( target.clone().add([0.5,0.5,0]),target.clone().add([0.5,0.5,2]),3)
                    this.blockInput =true

                    this.characterController.gotoAndIdle(target,1,()=>{
                        gsap.delayedCall(2,()=>{
                            GameModel.conversationHandler.startConversation("sea")
                            GameModel.conversationHandler.doneCallBack =()=> {
this.landLordConversation()
                            }
                        });

                    });
                }

        }

        return false;
    }
   landLordConversation() {
       let target =new Vector3(5, 0.5,0)
       this.landlord.y = 0
       GameModel.gameCamera.TweenToLockedView( target,target.clone().add([0.0,0.0,2]),1)
       gsap.delayedCall(0.5,()=> {
           GameModel.conversationHandler.startConversation("readBoy")
           GameModel.conversationHandler.doneCallBack = () => {
               // this.landLordConversation()

                   let target =new Vector3(5.8, 0,0)


               this.characterController.gotoAndIdle(target,-1,()=>{})
               gsap.delayedCall(0.5,()=> {
                   GameModel.conversationHandler.startConversation("landlordConversation")
                   GameModel.conversationHandler.doneCallBack = () => {
   LevelHandler.setLevel("Sea")
                   }

               })
           }
       });
    }
    update() {
        super.update();
        this.sea.update()
        this.rootShip.y =Math.sin(Timer.time*0.5)*0.03
        this.rootShip.rz =Math.sin(Timer.time*0.33)*0.02 +Math.PI
    }

    destroy(){
        super.destroy()
        if(this.tl) this.tl.clear()

    }


}
