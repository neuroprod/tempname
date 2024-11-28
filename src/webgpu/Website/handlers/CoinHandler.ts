import Renderer from "../../lib/Renderer.ts";
import SoundHandler from "../SoundHandler.ts";
import Timer from "../../lib/Timer.ts";

export default class CoinHandler{

    numCoins = 0
    displayCoins =0;
    displayTime =0
    constructor(renderer:Renderer) {

    }
    public addCoins(numCoins:number)
    {
        this.numCoins += numCoins;
        SoundHandler.playCoin()
    }
    update(){
        if(this.numCoins!=this.displayCoins){
            this.displayTime-=Timer.delta;
            if(this.displayTime<0){
                if(this.numCoins<this.displayCoins){
                    this.displayCoins--
                    SoundHandler.playCoin()
                }
                 else if(this.displayCoins){
                    this.displayCoins++
                    SoundHandler.playCoin()
                }
                if(this.numCoins!=this.displayCoins){
                    this.displayTime =0.6;
                }
            }

        }


    }

}
