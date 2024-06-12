import {Vector2} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import UIAnimationEditor, {UIAnimationEditorSettings} from "./UIAnimationEditor.ts";
import Animation, {AnimationType} from "./animation/Animation.ts";

import SceneObject3D from "../SceneObject3D.ts";
import AnimationChannel from "./animation/AnimationChannel.ts";
import AnimationChannelEditor from "./AnimationChannelEditor.ts";
import AnimationEditorGroup from "./AnimationEditorGroup.ts";

import Timer from "../../lib/Timer.ts";


class AnimationEditor {

    public readonly frameSize = 10;


    models: Array<SceneObject3D> = []
    isDrawDirty: boolean = true
    public currentAnimation: Animation | null = null;
    root: AnimationEditorGroup | null = null;
    private channelEditors: Array<AnimationChannelEditor> = [];
    isRecording = true;
    isPlaying =false;
    private currentModel!: SceneObject3D | null;
    private playTime: number =0;

    private totalTime: number=0;
    constructor() {


    }

    private _currentFrame = 0;

    get currentFrame(): number {
        return this._currentFrame;
    }

    set currentFrame(value: number) {
        if (this.currentAnimation) {
            this.isDrawDirty = true;
            this._currentFrame = Math.max(Math.min(value, this.currentAnimation.numFrames), 0);
            this.currentAnimation.setTime(this._currentFrame )
        }


    }

    setAnimation(anime: Animation | null) {
        this.models = []
        this.channelEditors=[]
        this.isPlaying =false
        this.isDrawDirty =true
        this.isRecording =false;
        if (this.root){
            this.root.destroy()
            this.root =null;
        }

        this.currentAnimation = anime;
        if (this.currentAnimation) {
            this.currentModel = this.currentAnimation.root


            for(let channel of this.currentAnimation.channels){

                let id =channel.sceneObject3D.UUID + "_" + channel.type;
                let label = "Position";
                if (channel.type == AnimationType.SCALE) label = "Scale";
                if (channel.type  == AnimationType.ROTATE) label = "Rotation";
                let channelEditor = new AnimationChannelEditor(label, channel, id);
                this.channelEditors.push(channelEditor);
            }


            this.root = new AnimationEditorGroup(this.currentAnimation.label)
            this.currentAnimation.root.makeAnimationGroups(this.root)

            this.root.setInitialUIKeys()


        }
        this.currentFrame =0;
    }
    play() {
        if(!this.currentAnimation)return;
        this.isPlaying =true;
        this.playTime = this.currentFrame;
        this.totalTime = this.currentAnimation.numFrames;
    }

    pause() {
        this.isPlaying =false;
    }
    public update(){
        if(!this.currentAnimation)  {
              return
        }
        if(this.isPlaying){
            this.playTime+=Timer.delta/this.currentAnimation.frameTime;

            if(this.playTime>this.totalTime){this.playTime-=this.totalTime}
            this.currentAnimation.setTime(this.playTime)
            this.currentFrame =Math.floor( this.playTime)
        }
    }


    onMouseDown(pos: Vector2) {
        console.log(pos);
       // this.root.onMouseDown(pos)
    }

    onUI() {
        if (this.currentAnimation) {
            if (!UI.initialized) return;
            UI.pushWindow("Animation")

            let id = "timeLine";
            if (!UI_I.setComponent(id)) {
                let comp = new UIAnimationEditor(UI_I.getID(id), new UIAnimationEditorSettings());
                UI_I.addComponent(comp);
            }
            UI_I.popComponent();
            UI.popWindow()
        }
    }

    getChannelEditor(model: SceneObject3D, type: AnimationType, makeNew: boolean = true) {
        if (!this.currentAnimation) return;
        let id = model.UUID + "_" + type;
        for (let ch of this.channelEditors) {
            if (ch.id == id) return ch;
        }
        if (makeNew) {
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

    addKeyData(model: SceneObject3D, type: AnimationType, force: boolean = false) {
        if (!this.currentAnimation) return;
        if(this.isPlaying)return;
        if (!this.isRecording && !force) return;

        let channelEditor = this.getChannelEditor(model, type, false)
        if (channelEditor) {
            channelEditor.addKey(this.currentFrame)
            this.isDrawDirty = true;
        }

    }

    addAllKeysToModel(model: SceneObject3D) {
        this.addKeyData(model, AnimationType.TRANSLATE, true)
        this.addKeyData(model, AnimationType.ROTATE, true)
        this.addKeyData(model, AnimationType.SCALE, true)
    }

    addKeysSelected() {
        if (this.currentModel)
            this.addAllKeysToModel(this.currentModel)
    }

    addKeysAll() {
        for (let m of this.models) {
            this.addAllKeysToModel(m)
        }
    }

    setCurrentModel(currentModel: SceneObject3D | null) {
        if (!this.currentAnimation) return;
        if (currentModel) {

            if (this.models.includes(currentModel)) {
                this.currentModel = currentModel;

                return;
            }

        }

        this.currentModel = null;

    }


    drawUITree() {
        if(this.root)
        this.root.drawUITree()
    }

    drawKeyFrames() {
        if(this.root){
            UI.pushID(this.root.label)
            this.root.drawUIKeyframes()
            UI.popID();
        }
    }

    clearAllSelectFrames() {
        this.root?.keyDataMain.clearAllSelectFrames();
    }
}

export default new AnimationEditor()

