import TextBalloonHandler from "./TextBalloonHandler.ts";
import copy from "./copy.json"
import SceneData from "../../data/SceneData.ts";
import Renderer from "../../lib/Renderer.ts";
import {Vector3} from "@math.gl/core";
export default class ConversationHandler {
    private textBalloonHandler: TextBalloonHandler;
    private dataArr!:any;
    private renderer: Renderer;
    private dataIndex: number =0;
    textReady: boolean =false;

    constructor(renderer:Renderer,textBalloonHandler: TextBalloonHandler) {
        this.renderer =renderer;
        this.textBalloonHandler = textBalloonHandler;
    }

    startConversation(id: string) {

        this.dataArr =this.getCopyData(id);
        this.dataIndex =0


    }
    setText(){

        if(this.dataArr.length==this.dataIndex){
            this.textBalloonHandler.hideText()
            return true;
        }
        this.textReady =false

        let data = this.dataArr[this.dataIndex]

        if(data.char && data.pos) {
            let m = SceneData.sceneModelsByName[data.char];

            this.textBalloonHandler.setModel(m,data.pos)

        }

        this.textBalloonHandler.setText(data.text)
        this.dataIndex++;

        setTimeout(()=>{this.textReady=true},1000)

        return false

    }
    getCopyData(id:string){
        for (let data of copy){
            if(data.name==id)return data.data
        }

    }

}
