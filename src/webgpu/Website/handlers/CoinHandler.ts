
import {HitTrigger} from "../../data/HitTriggers.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";
import Timer from "../../lib/Timer.ts";

export default class CoinHandler{

private coins :Array<SceneObject3D> =[];
    constructor() {
           /* for(let c of SceneData.triggerModels){
                console.log(c.hitTriggerItem )
                if(c.hitTriggerItem ==HitTrigger.COIN){
                    this.coins.push(c)
                    c.ry =0;
                    c.show()
                }
            }*/
        console.log(    this.coins)
    }


    update() {
      /*  let rotSpeed =1*Timer.delta;
        for(let c of this.coins){
            c.ry+=rotSpeed;

        }*/
    }
}
