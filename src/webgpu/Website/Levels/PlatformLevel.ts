import {BaseLevel} from "./BaseLevel.ts";
import CharacterController from "../CharacterController.ts";
import Timer from "../../lib/Timer.ts";
import SceneHandler from "../../data/SceneHandler.ts";
import CoinHandler from "../handlers/CoinHandler.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";
import {HitTrigger} from "../../data/HitTriggers.ts";

export class PlatformLevel extends BaseLevel{
    public characterController!: CharacterController;
    private coinHandler!: CoinHandler;

    blockInput =false

    init() {
        super.init();
        this.characterController = new CharacterController(this.levelObjects.renderer)

    }
    configScene(){
        this.coinHandler =new CoinHandler()
        this.levelObjects.conversationHandler.dataCallBack =this.conversationDataCallBack.bind(this)
        this.blockInput =false;
this.levelObjects.gameRenderer.setLevelType("platform")
    }
    update(){

        this.levelObjects.gamepadInput.update();
        let delta = Timer.delta;
        let jump = this.levelObjects.keyInput.getJump()
        let hInput = this.levelObjects.keyInput.getHdir()
        if (this.levelObjects.gamepadInput.connected) {

            if (hInput == 0) hInput = this.levelObjects.gamepadInput.getHdir()

            if (!jump) jump = this.levelObjects.gamepadInput.getJump()
        }

        if( !this.blockInput){
            this.characterController.update( delta, hInput, jump)
        }else{
            this.characterController.updateIdle(delta)
            this.levelObjects.conversationHandler.setInput(hInput, jump)
            this.levelObjects.textBalloonHandler.update()

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
            return true;
        }
        return false;
    }
}
