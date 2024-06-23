import AnimationChannel from "./animation/AnimationChannel.ts";
import Vec2 from "../../lib/UI/math/Vec2.ts";

import Font from "../../lib/UI/draw/Font.ts";
import UIKeyFrameData, {UIKeyFrames} from "./UIKeyFrameData.ts";


export default class AnimationChannelEditor{
    private channel: AnimationChannel;
    id: string;
    public label: string;

    private textSize: Vec2;
    public keyData: UIKeyFrameData;

    constructor(label:string,channel:AnimationChannel,id:string) {
        this.label =label;
        this.channel =channel;
        this.id =id;
        this.textSize =Font.getTextSize(label);
        this.keyData =new UIKeyFrameData()

        this.keyData.channel =channel;


    }
    setKeys(){
        for(let key of this.channel.keys){

            this.keyData.addKey(key.frame)

        }
    }

    addKey(frame: number) {
        this.channel.addKey(frame);
        this.keyData.addKey(frame)


    }




    destroy() {
this.keyData.destroy()
    }


}
