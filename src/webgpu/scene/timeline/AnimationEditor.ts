import {Vector2} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import UIAnimationEditor, {UIAnimationEditorSettings} from "./UIAnimationEditor.ts";
import Animation, {AnimationType} from "./animation/Animation.ts";

import SceneObject3D from "../SceneObject3D.ts";
import AnimationChannel from "./animation/AnimationChannel.ts";
import AnimationChannelEditor from "./AnimationChannelEditor.ts";
import AnimationEditorGroup from "./AnimationEditorGroup.ts";


class AnimationEditor {


    private channelEditors: Array<AnimationChannelEditor>=[];
    private channelEditorsByID: { [id: string]: AnimationChannelEditor } = {};

    isDrawDirty: boolean =true
    numFrames =150;
    frameTime =1/30;
    private _currentFrame =0;
    private isRecording =true;
    private currentAnimation: Animation|null =null;

    private root =new AnimationEditorGroup("root")

    constructor() {


    }
    get currentFrame(): number {
        return this._currentFrame;
    }

    set currentFrame(value: number) {
        this.isDrawDirty =true;
        this._currentFrame =Math.max( Math.min(value,this.numFrames),0);
        if(this.currentAnimation){
            this.currentAnimation.setTime(this._currentFrame* this.frameTime)
        }


    }
    setAnimation(anime:Animation){
        this.currentAnimation = anime;
    }
    onMouseDown(pos:Vector2){
        console.log(pos);

    }
     onUI()
    {
        if (!UI.initialized) return;
        let id = "timeLine";
        if (!UI_I.setComponent(id)) {
            let comp = new UIAnimationEditor(UI_I.getID(id), new  UIAnimationEditorSettings());
            UI_I.addComponent(comp);
        }
        UI_I.popComponent();
    }


    addKeyData(model: SceneObject3D, type: AnimationType,force:boolean=false) {
        if(!this.currentAnimation)return;
        if(!this.isRecording && !force)return;

        let id  =model.UUID+"_"+type;
        let channelEditor = this.channelEditorsByID[id];
        if(!channelEditor)
        {

            let channel = new AnimationChannel(model, type);
            this.currentAnimation.channels.push(channel);
             let label ="Position"
            if(type==AnimationType.SCALE)label ="Scale"
            if(type==AnimationType.ROTATE)label ="Rotation"
            channelEditor = new AnimationChannelEditor(label, channel, id);
            this.channelEditors.push(channelEditor);
            this.channelEditorsByID[id] = channelEditor;
        }
        channelEditor.addKey(this.currentFrame,this.currentFrame*this.frameTime)

    }
}
export default new AnimationEditor()

