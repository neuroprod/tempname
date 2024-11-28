import Renderer from "../../lib/Renderer.ts";
import SoundHandler from "../SoundHandler.ts";
import Timer from "../../lib/Timer.ts";
import Model from "../../lib/model/Model.ts";
import TextBalloonFontMaterial from "../conversation/TextBalloonFontMaterial.ts";
import TextBalloonFontMesh from "../conversation/TextBalloonFontMesh.ts";
import ProjectData from "../../data/ProjectData.ts";
import GameModel from "../GameModel.ts";

export default class CoinHandler{

    numCoins = 0
    displayCoins =0;
    displayTime =0
    private textModel: Model;
    private textMesh: TextBalloonFontMesh;
    constructor(renderer:Renderer) {
        this.textModel = new Model(renderer, "textModel")
        this.textModel.material = new TextBalloonFontMaterial(renderer, "textBalloonFontMaterial")

        this.textMesh = new TextBalloonFontMesh(renderer)
        this.textMesh.setText( this.displayCoins+"", ProjectData.font, 0.15)

        this.textModel.mesh = this.textMesh;
        this.textModel.setScaler(2)

        GameModel.overlay.modelRenderer.addModel(this.textModel)
    }
    public addCoins(numCoins:number)
    {
        this.numCoins += numCoins;

    }
    update(){
        this.textModel.y =100
        if(this.numCoins!=this.displayCoins){

            this.displayTime-=Timer.delta;
            if(this.displayTime<0){

                if(this.numCoins<this.displayCoins){
                    this.displayCoins--
                    SoundHandler.playCoin()
                }
                 else {
                    this.displayCoins++
                    SoundHandler.playCoin()
                }
               this.textMesh.setText(""+this.displayCoins, ProjectData.font, 0.15)
                if(this.numCoins!=this.displayCoins){
                    this.displayTime =0.1;
                }
            }

        }


    }

    hide() {
        this.textModel.visible=false
    }
    show() {
        this.textModel.visible=true
    }
}
