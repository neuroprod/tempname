
import {HitTrigger} from "../../data/HitTriggers.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";
import Timer from "../../lib/Timer.ts";
import SceneHandler from "../../data/SceneHandler.ts";

import gsap from "gsap";

import GameModel from "../GameModel.ts";
export default class CoinGrabber {

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

       let rotSpeed =Timer.delta;
        for(let c of this.coins){
            c.ry+=rotSpeed;

        }
    }

    takeCoin(f: SceneObject3D) {
        f.triggerIsEnabled =false;

        GameModel.coinHandeler.addCoins(1)
        gsap.to(f,{ sx:0,sy:0,sz:0,ease:"back.in",duration:0.2,onComplete:()=>{f.hide();}})
    }
}
