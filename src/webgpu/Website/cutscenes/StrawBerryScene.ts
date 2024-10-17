import CharacterController from "../CharacterController.ts";
import GameCamera from "../GameCamera.ts";
import Timer from "../../lib/Timer.ts";
import {Vector3} from "@math.gl/core";
import gsap from "gsap";
import ConversationHandler from "../conversation/ConversationHandler.ts";
export default class StrawBerryScene{
    characterController!: CharacterController;
    gameCamera!: GameCamera;
    conversationHandler!: ConversationHandler;
    public finished =true;

   camPos =new Vector3(2.4, 0.12452151451113799+0.1, 1.7811109374079286)
    camTarget=new Vector3(2.4, -0.03203107766738261+0.2, 0.013283899312188208)
   waitUserInput: boolean =false;
    inputDown =false;
    constructor() {
    }
    public start(){
        this.finished =false;
        let tl =gsap.timeline()

        tl.to(  this.gameCamera.camera.cameraLookAt,{x:this.camTarget.x,y:this.camTarget.y,z:this.camTarget.z,ease:"power2.Out" ,duration:1.0},0)
        tl.to(  this.gameCamera.camera.cameraWorld,{x:this.camPos.x,y:this.camPos.y,z:this.camPos.z,ease:"power2.Out" , duration:1.0},0)
        tl.to(this.characterController.charRoot,{ry:0.5},0)
        tl.call(this.startConversation.bind(this),[],1)
       // tl.to(this.characterController.charRoot,{ry:0.0,duration:1},2)

       // tl.call(()=>{this.gameCamera.tweenToDefaultPos()},[],2)
       // tl.call(()=>{this.finished =true},[],3)
    }
    startConversation(){
        this.conversationHandler.startConversation("strawBerry")

        this.waitUserInput =true;
    }

    update() {
       if(this.characterController.targetPos.x < 2){
           this.characterController.update(Timer.delta, 1, false)
       }else{
           this.characterController.update(Timer.delta, 0, false)
       }
       // this.gameCamera.updateForScene()

    }

    setInput(hInput: number, jump: boolean) {

        if(this.waitUserInput){
            this.conversationHandler.setInput(hInput,jump)

           // this.conversationHandler.setText()
         if( this.conversationHandler.isDone){
               let tl =gsap.timeline()
               tl.to(this.characterController.charRoot,{ry:0.0,duration:1},0)

               tl.call(()=>{this.gameCamera.tweenToDefaultPos()},[],0)
               tl.call(()=>{this.finished =true},[],1)
           }
        }
    }
}
