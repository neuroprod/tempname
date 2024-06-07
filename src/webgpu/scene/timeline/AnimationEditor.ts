
import {Vector2} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import UIAnimationEditor, {UIAnimationEditorSettings} from "./UIAnimationEditor.ts";
import Animation from "./animation/Animation.ts";

class AnimationEditor {
    get currentFrame(): number {
        return this._currentFrame;
    }

    set currentFrame(value: number) {
        this.isDrawDirty =true;
        this._currentFrame =Math.max( Math.min(value,this.numFrames),0);
    }
    isDrawDirty: boolean =true
    numFrames =30;
    frameTime =1/30;
    private _currentFrame =5;

    private currentAnimation: Animation|null =null;
    constructor() {


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


}
export default new AnimationEditor()

