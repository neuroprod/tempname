
import {PlatformLevel} from "../PlatformLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import sceneHandler from "../../../data/SceneHandler.ts";
import gsap from "gsap";
import SceneObject3D from "../../../data/SceneObject3D.ts";

import GameModel from "../../GameModel.ts";

import Timer from "../../../lib/Timer.ts";
import {Vector3} from "@math.gl/core";
import SeaFull from "./SeaFull.ts";



export class SeaLevel extends PlatformLevel{
    private tl!: gsap.core.Timeline;

    private rootShip!: SceneObject3D;
    private sea!: SeaFull;
    private foam!: SceneObject3D;






    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        LoadHandler.startLoading()
        SceneHandler.setScene("51c74f13-320e-4899").then(() => {


            SceneHandler.addScene("edb3050b-b132-4957").then(() => {
                LoadHandler.stopLoading()
            });

            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });

            SceneHandler.addScene("9f307f29-4140-48d6").then(() => {
                LoadHandler.stopLoading()
            });
            SceneHandler.addScene("58745956-acac-4aba").then(() => {
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


        this.rootShip = sceneHandler.getSceneObject("rootShip")
        this.rootShip.x =-7
        this.rootShip.z =-0.7

        let char = sceneHandler.getSceneObject("charRoot")
        char.x = -1.6;
        char.y = 0.4;
        char.ry = Math.PI;
        char.setScaler(1.2)
        this.rootShip.addChild(char)


        let tree = sceneHandler.getSceneObject("rootTree")
        tree.setScaler(1.5)
        tree.z =0
        tree.x =1.5
        tree.y =0.3
        tree.ry = Math.PI;
        tree.rz = 0.02;
        this.rootShip.addChild( tree)


        let cookie = sceneHandler.getSceneObject("cookieRoot")
        cookie.setScaler(1.3)
        cookie.z =0
        cookie.x =0
        cookie.y =0.3
        cookie.ry =Math.PI;
        this.rootShip.addChild( cookie)


        let strawberyy = sceneHandler.getSceneObject("strawberryRoot")
        strawberyy.setScaler(1.2)
        strawberyy.z =0.1
        strawberyy.x =0.7
        strawberyy.y =0.7
        strawberyy.ry =Math.PI;
        this.rootShip.addChild( strawberyy)

this.foam = sceneHandler.getSceneObject("foamHolder")
        for (let s of this.foam.children){
            s.rz=Math.random()*6
        }

      //this.characterController.setCharacter()
        GameModel.gameCamera.setCharacter()
        GameModel.gameCamera.setLockedView(new Vector3(0,1,0),new Vector3(0,1,4))
        GameModel.gameRenderer.setModels(SceneHandler.allModels)
       // GameModel.gameRenderer.addModel(this.characterController.cloudParticles.particlesModel)

      this.sea =new SeaFull(GameModel.renderer)
       GameModel.gameRenderer.addModel(this.sea.seaModel)

        GameModel.gameCamera.camDistance =8;
        GameModel.gameCamera.heightOffset =0.5



this.tl =gsap.timeline()
this.tl.to( this.rootShip,{x:0,duration:15})







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
        this.rootShip.y =Math.sin(Timer.time*2.4)*0.03
        this.rootShip.rz =Math.sin(Timer.time*1)*0.02 +Math.PI+0.05

        this.foam.y =-this.rootShip.y/this.rootShip.sy

       for (let s of this.foam.children){
           s.rz-=Timer.delta
       }

    }

    destroy(){
        super.destroy()
        if(this.tl) this.tl.clear()

    }
}
