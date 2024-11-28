import {BaseLevel} from "./BaseLevel.ts";
import CharacterController from "../CharacterController.ts";
import Timer from "../../lib/Timer.ts";
import SceneHandler from "../../data/SceneHandler.ts";
import CoinGrabber from "../handlers/CoinGrabber.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";
import {HitTrigger} from "../../data/HitTriggers.ts";
import GameModel from "../GameModel.ts";

export class PlatformLevel extends BaseLevel{
    public characterController!: CharacterController;
    private coinHandler!: CoinGrabber;

    blockInput =false

    init() {
        super.init();
        this.characterController = new CharacterController(GameModel.renderer)
        GameModel.coinHandeler.show()
    }
    configScene(){
        this.coinHandler =new CoinGrabber()
       GameModel.conversationHandler.dataCallBack =this.conversationDataCallBack.bind(this)
        this.blockInput =false;
       GameModel.gameRenderer.setLevelType("platform")
    }
    update(){

       GameModel.gamepadInput.update();
        let delta = Timer.delta;
        let jump =GameModel.keyInput.getJump()
        let hInput = GameModel.keyInput.getHdir()
        if (GameModel.gamepadInput.connected) {

            if (hInput == 0) hInput = GameModel.gamepadInput.getHdir()

            if (!jump) jump = GameModel.gamepadInput.getJump()
        }

        if( !this.blockInput){
            this.characterController.update( delta, hInput, jump)
        }else{
            this.characterController.updateIdle(delta)
           GameModel.conversationHandler.setInput(hInput, jump)
           GameModel.textBalloonHandler.update()

        }
        this.coinHandler.update()
        this.checkTriggers()

    }
    private checkTriggers() {
        for (let f of SceneHandler.triggerModels) {
            f.drawTrigger();
             if (f.checkTriggerHit(this.characterController.charHitBottomWorld, this.characterController.charHitTopWorld, this.characterController.charHitRadius)) {
                 this.resolveHitTrigger(f)

             }

        }

    }
    conversationDataCallBack(data:string){

    }
    resolveHitTrigger(f: SceneObject3D) {
        if(f.hitTriggerItem ==HitTrigger.COIN){
            this.coinHandler.takeCoin(f)
           GameModel.numCoins++;
            return true;
        }
        return false;
    }
}
