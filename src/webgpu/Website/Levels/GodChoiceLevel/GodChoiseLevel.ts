import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";

import sceneHandler from "../../../data/SceneHandler.ts";

import {Vector3} from "@math.gl/core";

import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
import LevelHandler from "../LevelHandler.ts";
import God from "../GodLevel/God.ts";
import GameModel from "../../GameModel.ts";

export default class GodChoiceLevel extends BaseLevel{
    private god!: SceneObject3D;



    private selectItems:Array<SceneObject3D>=[]
    private presentItems:Array<SceneObject3D>=[]
    private presentStartScale:Array<number>=[]
    private selectIndex =0;
    private switchTime =0;
    private speed =0.1;
    private state =0;
    private godHandler!: God;
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

        GameModel.gameRenderer.setModels(SceneHandler.allModels)

        this.god = sceneHandler.getSceneObject("godRoot")
        this.god.setScaler(1.3)



        this.godHandler =new God()
        this.godHandler.initGame()

        let holder = sceneHandler.getSceneObject("godHolder")
        holder.addChild(this.god)
        GameModel.textBalloonHandler.setModel(this.god,[0.15,0.8,0])
        GameModel.textBalloonHandler.setText("Ow boy, Get ready!")
        GameModel.gameCamera.setLockedView(new Vector3(0,.32,0),new Vector3(0,.32,2))

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

        GameModel.conversationHandler.doneCallBack =()=>{
            GameModel.presentID =this.selectIndex;

            LevelHandler.setLevel("Cookie")
        }
    }
    update() {
        super.update();
 this.godHandler.update()

        let jump = GameModel.keyInput.getJump()
        if (GameModel.gamepadInput.connected) {
            if (!jump) jump = GameModel.gamepadInput.getJump()
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
            GameModel.conversationHandler.setInput(0, jump)
            GameModel.textBalloonHandler.update()
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
destroy() {
    super.destroy();

        this.godHandler.destroy()

}

    private setChoise() {
        let tl =gsap.timeline()
        tl.to(this.presentItems[this.selectIndex],{sx: this.presentStartScale[this.selectIndex]*1.1,sy: this.presentStartScale[this.selectIndex]*1.2})
        GameModel.conversationHandler.startConversation("godPresent"+this.selectIndex)

    }
}
