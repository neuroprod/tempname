import AnimationChannel from "./animation/AnimationChannel.ts";
import Vec2 from "../../lib/UI/math/Vec2.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import Color from "../../lib/UI/math/Color.ts";
import AnimationEditor from "./AnimationEditor.ts";
import Font from "../../lib/UI/draw/Font.ts";


export default class AnimationChannelEditor{
    private channel: AnimationChannel;
    id: string;
    private label: string;
    private basePos =new Vec2()
    private textSize: Vec2;
    private keyPositions:Array<Vec2>=[]
    constructor(label:string,channel:AnimationChannel,id:string) {
        this.label =label;
        this.channel =channel;
        this.id =id;
        this.textSize =Font.getTextSize(label);
    }

    addKey(frame: number) {
        this.channel.addKey(frame);
    }


    drawUI() {
        UI_I.currentDrawBatch.textBatch.addLine(this.basePos,this.label,1000,new Color(1,1,1))
        for(let p of this.keyPositions){
            UI_I.currentDrawBatch.fillBatch.addKeyframe(p,new Color(1,1,1))
        }
    }

    prepUI(pos: Vec2) {
       this.basePos.copy(pos);

       this.basePos.x+=AnimationEditor.keyFramesOffset.x-this.textSize.x-10;
        this.basePos.y+=3
        this.keyPositions=[]

        for(let k of this.channel.keys){
            let f = k.frame
            let v =new Vec2()
            v.copy(pos)
            v.x+=AnimationEditor.frameSize*f+AnimationEditor.keyFramesOffset.x;
            v.y+=8;
            this.keyPositions.push(v)
        }
    }
}
