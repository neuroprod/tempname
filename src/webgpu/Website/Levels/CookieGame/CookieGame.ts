import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";

import sceneHandler from "../../../data/SceneHandler.ts";



import {Vector3} from "@math.gl/core";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
import SoundHandler from "../../SoundHandler.ts";
class StrawberryData{
    strawBerry:SceneObject3D;
    hamer:SceneObject3D;
    splash:SceneObject3D;

    private sbTopPos: Vector3;
    private sbBottomPos: Vector3;
    private tl2!: gsap.core.Timeline;
    private tl!: gsap.core.Timeline;
    isHitting =false;
    private hamerY: number=0;

    constructor(index:number){

        this.strawBerry = sceneHandler.getSceneObject("strawberry"+index)
        this.sbTopPos =  this.strawBerry.getPosition().clone()
        this.sbBottomPos = this.sbTopPos.clone();
        this.sbBottomPos.y-=0.24
        this.sbBottomPos.z-=0.1
        this.strawBerry.setPositionV(this.sbBottomPos)
        this.hamer = sceneHandler.getSceneObject("hamer"+index)
       this.hamerY = this.hamer.y;
        this.hamer.hide()
        this.splash= sceneHandler.getSceneObject("splash"+index)
        this.splash.hide()
    }
    destroy(){

        if(this.tl2)this.tl2.clear()
        if(this.tl)this.tl.clear()
        this.strawBerry.setPositionV(this.sbTopPos)
        this.hamer.y =this.hamerY;
    }

    show() {
        if(this.isHitting)return;
        if(this.tl)this.tl.clear()
        this.tl =gsap.timeline();
        this.tl.to(this.strawBerry,{x: this.sbTopPos.x,y: this.sbTopPos.y, z:this.sbTopPos.z,duration:0.3,ease:"back.out"})
        this.tl.to(this.strawBerry,{x: this.sbBottomPos.x,y: this.sbBottomPos.y, z:this.sbBottomPos.z,duration:0.2,ease:"power2.in"},0.3+Math.random()*0.3)
    }

    hitHole() {



        if(this.tl2)this.tl2.clear()
        this.isHitting =true;
        this.tl2 =gsap.timeline();
        let hit = false;
        if(this.strawBerry.y>this.sbBottomPos.y+0.001){
            hit =true;

        }
        SoundHandler.playWetHit(hit)
        this.hamer.show()
        this.hamer.y =this.hamerY+0.5
        this.tl2.to(this.hamer,{y:this.hamerY,duration:0.1})
        if(hit){
           this.tl2.call(()=>{
            this.tl.clear()
            this.strawBerry.setPositionV(this.sbBottomPos)
            this.splash.show()
           },[],0.1);
            this.tl2.call(()=>{

                this.splash.hide()
            },[],0.4);
        }
        this.tl2.to(this.hamer,{y:this.hamerY+1,duration:0.1},0.4)
        this.tl2.call(()=>{
            this.hamer.hide()
            this.isHitting =false

        },[],0.5)
        this.strawBerry.setPositionV( this.sbBottomPos)
        return hit
    }
}

export default class CookieGame extends BaseLevel{

    private strawBerryData:Array<StrawberryData>=[]
    public nextStrawBerryTime =2;
    private currentStrawBerry: number=-1;
    private hole0prev =false;
    private hole1prev =false;
    private hole2prev =false;
    private points =0;
    private hat!: SceneObject3D;
    private hatY: number=0;
    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()



        SceneHandler.setScene("7949acae-4a94-406d").then(() => {

            LoadHandler.stopLoading()
        })

    }

    private configScene() {

        LoadHandler.onComplete =()=>{}

        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)

        this.levelObjects.gameCamera.setLockedView(new Vector3(-0,.5,0),new Vector3(-0.0-0.04,.6,1.6))
        this.hat = sceneHandler.getSceneObject("hat")
this.hatY =this.hat.y;
        let cookie = sceneHandler.getSceneObject("cookieBody")

        this.levelObjects.textBalloonHandler.setModel(cookie,[-0.1,0.35,0])
        this.levelObjects.textBalloonHandler.setText("Smash those assholes!")
        this.strawBerryData =[]
        for(let i=0;i<3;i++){
            let sbData =new StrawberryData(i)
            this.strawBerryData.push(sbData);
        }
this.points =0;

    }
    update() {
        super.update();

        this.nextStrawBerryTime-=Timer.delta;
        if(this.nextStrawBerryTime<0){
            this.currentStrawBerry =Math.floor(Math.random()*3);

            this.strawBerryData[this.currentStrawBerry].show()
            this.nextStrawBerryTime =1.5+Math.random()*1.5;
        }

        let jump = this.levelObjects.keyInput.getJump()
        let hInput = this.levelObjects.keyInput.getHdir()
        if (this.levelObjects.gamepadInput.connected) {

            if (hInput == 0) hInput = this.levelObjects.gamepadInput.getHdir()

            if (!jump) jump = this.levelObjects.gamepadInput.getJump()
        }
        this.setHole(hInput==-1,jump,hInput==1)



    }
    public setHole(hole0:boolean,hole1:boolean,hole2:boolean){
        if(hole0 !=this.hole0prev){
            if(hole0)this.hitHole(0)
            this.hole0prev =hole0
        }
        if(hole1 !=this.hole1prev){
            if(hole1)this.hitHole(1)
            this.hole1prev =hole1
        }
        if(hole2 !=this.hole2prev){
            if(hole2)this.hitHole(2)
            this.hole2prev =hole2
        }

    }
    public hitHole(index:number){
        for(let sbD of this.strawBerryData){
            if(    sbD.isHitting)return;

        }
        if(this.strawBerryData[index].hitHole()){
            this.levelObjects.gameCamera.screenShakeCookie(0.1)
            this.points++;
            this.levelObjects.textBalloonHandler.setText("Yea! "+this.points+" kills!")

            this.hat.y =this.hatY+0.05
            gsap.to(this.hat,{y:this.hatY,ease:'power4.in',delay:0.1,duration:0.4})

        }else{
            this.levelObjects.gameCamera.screenShakeCookie(0.01)
            this.levelObjects.textBalloonHandler.setText("Ow, you missed")
        }





    }
    destroy() {
        super.destroy();
        for(let sbD of this.strawBerryData){
            sbD.destroy()
        }
        this.hat.y =this.hatY;
        this.strawBerryData =[]
    }
}
