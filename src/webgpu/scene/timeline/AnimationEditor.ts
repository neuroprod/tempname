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

    private _currentFrame =0;
    private isRecording =true;
    public currentAnimation: Animation|null =null;

    private root:AnimationEditorGroup|null=null;

    constructor() {


    }
    get currentFrame(): number {
        return this._currentFrame;
    }

    set currentFrame(value: number) {
        if(this.currentAnimation){
        this.isDrawDirty =true;
        this._currentFrame =Math.max( Math.min(value,this.currentAnimation?.numFrames),0);

            this.currentAnimation.setTime(this._currentFrame* this.currentAnimation.frameTime)
        }


    }
    setAnimation(anime:Animation|null){
        this.currentAnimation = anime;
        if(this.currentAnimation){
            if(this.root)this.root.destroy();
            this.root =new AnimationEditorGroup("root")
            this.currentAnimation.root.makeAnimationGroups(this.root)
            console.log(this.root);
        }

    }
    onMouseDown(pos:Vector2){
        console.log(pos);

    }
     onUI()
    {
        if(this.currentAnimation) {
            UI.pushWindow("Animation")
            if (!UI.initialized) return;
            let id = "timeLine";
            if (!UI_I.setComponent(id)) {
                let comp = new UIAnimationEditor(UI_I.getID(id), new UIAnimationEditorSettings());
                UI_I.addComponent(comp);
            }
            UI_I.popComponent();
            UI.popWindow()
        }
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
        channelEditor.addKey(this.currentFrame,this.currentFrame*this.currentAnimation.frameTime)

    }
}
export default new AnimationEditor()

