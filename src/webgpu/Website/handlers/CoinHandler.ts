
import {HitTrigger} from "../../data/HitTriggers.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";
import Timer from "../../lib/Timer.ts";
import SceneHandler from "../../data/SceneHandler.ts";
import SoundHandler from "../SoundHandler.ts";
import gsap from "gsap";
export default class CoinHandler{

private coins :Array<SceneObject3D> =[];
    constructor() {

        for(let c of SceneHandler.triggerModels){

                if(c.hitTriggerItem ==HitTrigger.COIN){
                    this.coins.push(c)
                    c.ry =0;
                    c.show()
                }
            }

    }


    update() {

       let rotSpeed =1*Timer.delta;
        for(let c of this.coins){
            c.ry+=rotSpeed;

        }
    }

    takeCoin(f: SceneObject3D) {
        f.triggerIsEnabled =false;
        SoundHandler.playCoin()

        gsap.to(f,{ sx:0,sy:0,sz:0,ease:"back.in",duration:0.2,onComplete:()=>{f.hide();}})
    }
}
