import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";

import sceneHandler from "../../../data/SceneHandler.ts";

import {Vector3} from "@math.gl/core";

import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
import LevelHandler from "../LevelHandler.ts";
export default class GodChoiceLevel extends BaseLevel{
    private god!: SceneObject3D;
    private arrow!: SceneObject3D;


    private selectItems:Array<SceneObject3D>=[]
    private presentItems:Array<SceneObject3D>=[]
    private presentStartScale:Array<number>=[]
    private selectIndex =0;
    private switchTime =0;
    private speed =0.1;
    private state =0;
    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()



        SceneHandler.setScene("5d87e394-0d20-43f1").then(() => {
            SceneHandler.addScene("0c10748d-698e-4393").then(() => {
                LoadHandler.stopLoading()
            });

            LoadHandler.stopLoading()
        })

    }

    private configScene() {

        LoadHandler.onComplete =()=>{}

        this.levelObjects.gameRenderer.setModels(SceneHandler.allModels)

        this.god = sceneHandler.getSceneObject("godRoot")
        this.god.setScaler(1.3)
        sceneHandler.getSceneObject("godLightning").hide()
        sceneHandler.getSceneObject("godNDA").hide()
        sceneHandler.getSceneObject("godCloud").hide()
        sceneHandler.getSceneObject("godPresent").hide()
        sceneHandler.getSceneObject("godLightning").hide()
        sceneHandler.getSceneObject("godHamer").hide()


        let holder = sceneHandler.getSceneObject("godHolder")
        holder.addChild(this.god)
        this.levelObjects.textBalloonHandler.setModel(this.god,[0.15,0.8,0])
        this.levelObjects.textBalloonHandler.setText("Ow boy, Get ready!")
        this.levelObjects.gameCamera.setLockedView(new Vector3(0,.32,0),new Vector3(0,.32,2))

        this.selectItems=[]
        this.selectItems.push( sceneHandler.getSceneObject("godSelect1"))
        this.selectItems.push( sceneHandler.getSceneObject("godSelect2"))
        this.selectItems.push( sceneHandler.getSceneObject("godSelect3"))
        this.selectItems.push( sceneHandler.getSceneObject("godSelect4"))

        this.presentItems=[]
        this.presentItems.push( sceneHandler.getSceneObject("godLightBoard"))
        this.presentItems.push( sceneHandler.getSceneObject("godPresentBoard"))
        this.presentItems.push( sceneHandler.getSceneObject("godNDABoard"))
        this.presentItems.push( sceneHandler.getSceneObject("godHamerBoard"))
        this.presentStartScale=[]
        for(let s of this.presentItems){
            this.presentStartScale.push(s.sy)
        }
        this.state=0
        this.selectIndex =-1;


        gsap.delayedCall(2,()=>{
            this.state=1

        })
        this.setSelectIndex()

        this.levelObjects.conversationHandler.doneCallBack =()=>{
            this.levelObjects.presentID =this.selectIndex;

            LevelHandler.setLevel("Cookie")
        }
    }
    update() {
        super.update();


        let jump = this.levelObjects.keyInput.getJump()
        if (this.levelObjects.gamepadInput.connected) {
            if (!jump) jump = this.levelObjects.gamepadInput.getJump()
        }


        if(this.state==1){
            if(jump){
                this.state=2
                this.setChoise()
                return;
            }

            this.switchTime-=Timer.delta
            if(this.switchTime<0){
                this.switchTime+=this.speed
                this.selectIndex++
                this.selectIndex%=4;
                this.setSelectIndex()
            }
        }
        if(this.state==2){
            this.levelObjects.conversationHandler.setInput(0, jump)
            this.levelObjects.textBalloonHandler.update()
        }


    }
    setSelectIndex(){
        for(let i=0;i<4;i++){
            if(i==this.selectIndex){
                this.selectItems[i].show()
                let tl =gsap.timeline()
                tl.to(this.presentItems[i],{sx: this.presentStartScale[i]*1.2,sy: this.presentStartScale[i]*1.2,duration:0.2},0)
                tl.to(this.presentItems[i],{sx: this.presentStartScale[i],sy: this.presentStartScale[i],duration:0.1},0.2)

            }  else{
                this.selectItems[i].hide()
            }

        }
    }

    private setChoise() {
        let tl =gsap.timeline()
        tl.to(this.presentItems[this.selectIndex],{sx: this.presentStartScale[this.selectIndex]*1.1,sy: this.presentStartScale[this.selectIndex]*1.2})
        this.levelObjects.conversationHandler.startConversation("godPresent"+this.selectIndex)

    }
}
