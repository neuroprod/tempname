import SceneObject3D from "../SceneObject3D.ts";
import Vec2 from "../../lib/UI/math/Vec2.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import Color from "../../lib/UI/math/Color.ts";

import {AnimationType} from "./animation/Animation.ts";
import AnimationChannelEditor from "./AnimationChannelEditor.ts";
import AnimationEditor from "./AnimationEditor.ts";
import Rect from "../../lib/UI/math/Rect.ts";

export default class AnimationEditorGroup{

    public parent:AnimationEditorGroup|null =null;
    public children:Array<AnimationEditorGroup>=[];
    private label: string;
    private obj: SceneObject3D | null;
    private offset: number=0;
    private position:Vec2 =new Vec2()
    private positionText:Vec2 =new Vec2()
    private mainRect =new Rect()
    private channels:Array<AnimationChannelEditor>=[];
    constructor(label:string,obj:SceneObject3D|null=null) {
        this.label =label;
        this.obj =obj;
        this.addChannels();
    }
    addChannels(){
        if(this.obj)
        {
            {
                let channelEditor = AnimationEditor.getChannelEditor(this.obj,AnimationType.TRANSLATE,true) as AnimationChannelEditor
                this.channels.push(channelEditor)
            }
            {
                let channelEditor = AnimationEditor.getChannelEditor(this.obj,AnimationType.ROTATE,true) as AnimationChannelEditor
                this.channels.push(channelEditor)
            }
            {
                let channelEditor = AnimationEditor.getChannelEditor(this.obj,AnimationType.SCALE,true) as AnimationChannelEditor
                this.channels.push(channelEditor)
            }
        }
    }
    destroy() {
        console.log("implement destroy")
    }
    setData(offset:number)
    {
        this.offset = offset;
        offset+=10;
        for(let c of this.children){
            c.setData(offset);
        }
    }
    addGroup(group: AnimationEditorGroup) {
        this.children.push(group)
    }
    getHeight(){

    }
    prepUI(pos:Vec2){
        this.position.copy(pos);
        this.position.x+=this.offset;

        this.positionText.copy(this.position)
        this.positionText.x+=20;
        this.positionText.y+=3;

        this.mainRect.pos.copy(this.position)
        this.mainRect.size.y=16;
        this.mainRect.size.x=AnimationEditor.keyFramesOffset.x-this.offset-10;

        for(let channel of this.channels){
           pos.y+=16;
            channel.prepUI(pos)

        }

        for(let c of this.children){
            pos.y+=18;
            c.prepUI( pos);
        }
    }
    drawUI() {

        UI_I.currentDrawBatch.fillBatch.addRect(this.mainRect,new Color(0.3,0.3,0.3))
        UI_I.currentDrawBatch.textBatch.addLine(this.positionText,this.label,1000,new Color(1,1,1))

        for(let channel of this.channels){
           channel.drawUI();

        }

        for(let c of this.children){

            c.drawUI()
        }
    }
}
