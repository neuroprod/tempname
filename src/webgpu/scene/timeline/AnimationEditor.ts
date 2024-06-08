import {Vector2} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import UIAnimationEditor, {UIAnimationEditorSettings} from "./UIAnimationEditor.ts";
import Animation, {AnimationType} from "./animation/Animation.ts";

import SceneObject3D from "../SceneObject3D.ts";
import AnimationChannel from "./animation/AnimationChannel.ts";
import AnimationChannelEditor from "./AnimationChannelEditor.ts";
import AnimationEditorGroup from "./AnimationEditorGroup.ts";
import Vec2 from "../../lib/UI/math/Vec2.ts";


class AnimationEditor {

    public readonly frameSize =10;
    public readonly keyFramesOffset =new Vec2(200,40)

    models:Array<SceneObject3D>=[]
    private channelEditors: Array<AnimationChannelEditor>=[];


    isDrawDirty: boolean =true

    private _currentFrame =0;
    private isRecording =true;
    public currentAnimation: Animation|null =null;

    root:AnimationEditorGroup|null=null;
    private currentModel!: SceneObject3D|null;

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
        this.models =[]

        this.currentAnimation = anime;
        if(this.currentAnimation){
            this.currentModel =this.currentAnimation.root

            if(this.root)this.root.destroy();
            this.root =new AnimationEditorGroup("objects")
            this.currentAnimation.root.makeAnimationGroups(this.root)


            this.root.setData(0);

        }

    }
    drawUI(){
        if(!this.root)return;

        this.root.drawUI()
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
    getChannelEditor(model: SceneObject3D,type :AnimationType,makeNew:boolean=true){
        if(!this.currentAnimation)return;
        let id  =model.UUID+"_"+type;
        for(let ch of this.channelEditors){
            if(ch.id ==id)return ch;
        }
        if(makeNew) {
            //not found make new
            let channel = new AnimationChannel(model, type);
            this.currentAnimation.channels.push(channel);
            let label = "Position"
            if (type == AnimationType.SCALE) label = "Scale"
            if (type == AnimationType.ROTATE) label = "Rotation"
            let channelEditor = new AnimationChannelEditor(label, channel, id);
            this.channelEditors.push(channelEditor);
            return channelEditor;
        }
        return null;
    }

    addKeyData(model: SceneObject3D, type: AnimationType,force:boolean=false) {
        if(!this.currentAnimation)return;
        if(!this.isRecording && !force)return;


        let  channelEditor =this.getChannelEditor(model,type,false)
        if(channelEditor){
            channelEditor.addKey(this.currentFrame,this.currentFrame*this.currentAnimation.frameTime)
            this.isDrawDirty=true;
        }


    }
    addAllKeysToModel(model: SceneObject3D){
        this.addKeyData(model, AnimationType.TRANSLATE,true)
        this.addKeyData(model, AnimationType.ROTATE,true)
        this.addKeyData(model, AnimationType.SCALE,true)
    }
    addKeysSelected() {
        if(this.currentModel)
        this.addAllKeysToModel(this.currentModel)
    }

    addKeysAll() {
        for (let m  of this.models){
            this.addAllKeysToModel(m)
        }
    }

    setCurrentModel(currentModel:SceneObject3D|null) {
        if(!this.currentAnimation)return;
        if(currentModel){

            if(this.models.includes(currentModel)){
                this.currentModel =currentModel;

                return;
            }

        }

        this.currentModel =null;

    }
}
export default new AnimationEditor()

