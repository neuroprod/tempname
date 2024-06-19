import Component, {ComponentSettings} from "../../lib/UI/components/Component.ts";

import AnimationEditor from "./AnimationEditor.ts";

import UI_I from "../../lib/UI/UI_I.ts";
import Color from "../../lib/UI/math/Color.ts";
import Rect from "../../lib/UI/math/Rect.ts";

import Vec2 from "../../lib/UI/math/Vec2.ts";

import Font from "../../lib/UI/draw/Font.ts";
import UI_IC from "../../lib/UI/UI_IC.ts";
import {ButtonBaseSettings} from "../../lib/UI/components/internal/ButtonBase.ts";
import {VerticalLayoutSettings} from "../../lib/UI/components/VerticalLayout.ts";

export class UIAnimationEditorSettings extends ComponentSettings {
    constructor() {
        super();
        this.box.size.set(-1, -1)
        this.hasOwnDrawBatch = true;
    }

}

export default class UIAnimationEditor extends Component {


//settings


//values

    private topLeft = new Vec2()
    private topLeftItems = new Vec2()
    private keysBackgroundRect = new Rect()
    private keysBackgroundColor = new Color().setHex("#444444", 1)
    private keysLineRect = new Rect()
    private keysLineColor = new Color().setHex("#5e5e5e", 1)
    //cursor
    private cursorDrag: boolean = false;
    private cursorPos = new Vec2()
    private cursorRect = new Rect(new Vec2(0, -21), new Vec2(20, 16))
    private cursorLineRect = new Rect()
    private cursorColor = new Color().setHex("#ff156c", 1)
    private cursorText: string = "";
    private cursorTextColor: Color = new Color().setHex("#FFFFFF", 1)
    private cursorTextPos = new Vec2()
    private keyFramesOffset = new Vec2()
    //temps

    private mouseStartDragX: number = 0;
    private cursorDragStartFrame: number = 0;
    private addKeySettings: ButtonBaseSettings;
    private addKeyAllSettings: ButtonBaseSettings;
    private playPauseSettings: ButtonBaseSettings;
    private startRecordSettings: ButtonBaseSettings;
    private stopRecordSettings: ButtonBaseSettings;
    private threeHolderSetting: ComponentSettings;
    private keyFrameSettings: VerticalLayoutSettings;


    constructor(id: number, settings: UIAnimationEditorSettings) {
        super(id, settings)
        this.size.copy(settings.box.size);
        let posMargin = 0
        this.addKeySettings = new ButtonBaseSettings()
        this.addKeySettings.box.size.set(73, 20)
        posMargin += 75
        this.addKeyAllSettings = new ButtonBaseSettings()
        this.addKeyAllSettings.box.size.set(73, 20)
        this.addKeyAllSettings.box.marginLeft = posMargin;
        posMargin += 75 + 20
        this.playPauseSettings = new ButtonBaseSettings()
        this.playPauseSettings.box.size.set(73, 20)
        this.playPauseSettings.box.marginLeft = posMargin;
        posMargin += 75
        this.startRecordSettings = new ButtonBaseSettings()
        this.startRecordSettings.box.size.set(73, 20)
        this.startRecordSettings.box.marginLeft = posMargin;

        this.stopRecordSettings = new ButtonBaseSettings()
        this.stopRecordSettings.box.size.set(73, 20)
        this.stopRecordSettings.backColor.set(1, 0, 0, 1)
        this.stopRecordSettings.box.marginLeft = posMargin;


        this.threeHolderSetting = new ComponentSettings()
        this.threeHolderSetting.box.size.x = 250;
        this.threeHolderSetting.box.marginTop = 22 + 20;

        this.keyFrameSettings = new VerticalLayoutSettings()
        this.keyFrameSettings.box.marginLeft = 260
        this.keyFrameSettings.box.marginTop = 22 + 20;
        this.keyFrameSettings.needScrollBar = false


        this.keyFramesOffset.y = 40;
        this.keyFramesOffset.x = this.keyFrameSettings.box.marginLeft;

    }

    onMouseDown() {
        super.onMouseDown();

        if (this.cursorRect.contains(UI_I.mouseListener.mousePos)) {

            this.mouseStartDragX = UI_I.mouseListener.mousePos.x
            this.cursorDrag = true;
            this.cursorDragStartFrame = AnimationEditor.currentFrame;


        } else {
            // AnimationEditor.onMouseDown(UI_I.mouseListener.mousePos)

        }

        // this.mousePos.copy(UI_I.mouseListener.mousePos)
        // this.mousePos.add(this.layoutRect.pos)
        //this.mousePos.add(this.keyFramesOffset)

    }

    onMouseUp() {
        super.onMouseUp();


        this.cursorDrag = false;
        //this.mousePos.copy(UI_I.mouseListener.mousePos)
        //this.mousePos.add(this.layoutRect.pos)
        //this.mousePos.add(this.keyFramesOffset)

    }

    updateOnMouseDown() {
        super.updateOnMouseDown();

        if (this.cursorDrag) {
            let mouseOffset = UI_I.mouseListener.mousePos.x - this.mouseStartDragX;
            let frameOffset = Math.round(mouseOffset / AnimationEditor.frameSize)
            AnimationEditor.currentFrame = this.cursorDragStartFrame + frameOffset;
        }
        // this.mousePos.copy(UI_I.mouseListener.mousePos)
        //this.mousePos.add(this.layoutRect.pos)
        //this.mousePos.add(this.keyFramesOffset)

    }


    onAdded() {

        super.onAdded();
        if (AnimationEditor.isDrawDirty) {
            this.setDirty()
            AnimationEditor.isDrawDirty = false;
        }
    }

    //set the correct size
    layoutRelative() {
        super.layoutRelative()

        //extend
        // this.size.y =300;
        //this.size.x =400;
    }

    //layout rect is set
    layoutAbsolute() {
        super.layoutAbsolute()
        this.topLeft.copy(this.layoutRect.pos)
        this.topLeft.add(this.keyFramesOffset);
        this.topLeftItems.copy(this.layoutRect.pos)
        this.topLeftItems.y += this.keyFramesOffset.y;
        //background
        this.keysBackgroundRect.pos.copy(this.topLeft)
        this.keysBackgroundRect.size.copy(this.layoutRect.size)
        this.keysBackgroundRect.size.sub(this.keyFramesOffset)
        this.keysLineRect.pos.copy(this.topLeft)
        this.keysLineRect.size.set(1, this.keysBackgroundRect.size.y)


        //cursor
        this.cursorPos.copy(this.topLeft)
        this.cursorPos.x += AnimationEditor.currentFrame * AnimationEditor.frameSize;
        this.cursorPos.y -= 2
        this.cursorLineRect.size.copy(this.keysLineRect.size);
        this.cursorLineRect.pos.copy(this.cursorPos)

        this.cursorRect.pos.copy(this.cursorLineRect.pos)
        this.cursorRect.pos.x -= this.cursorRect.size.x / 2;
        this.cursorRect.pos.y -= 16;
        this.cursorRect.setMinMax();

        this.cursorText = AnimationEditor.currentFrame + "";
        let size = Font.getTextSize(this.cursorText);
        this.cursorTextPos.copy(this.cursorRect.pos)
        this.cursorTextPos.x += this.cursorRect.size.x / 2 - size.x / 2
        this.cursorTextPos.y += this.cursorRect.size.y / 2 - size.y / 2 - 1


    }

    prepDraw() {
        if (this.layoutRect.size.x < 0 || this.layoutRect.size.y < 0) return;
        super.prepDraw();

//background
        UI_I.currentDrawBatch.fillBatch.addRect(this.keysBackgroundRect, this.keysBackgroundColor);

//backgroundLines
        // @ts-ignore
        for (let i = 1; i <= AnimationEditor.currentAnimation.numFrames; i++) {
            UI_I.currentDrawBatch.fillBatch.addRect(this.keysLineRect, this.keysLineColor);
            this.keysLineRect.pos.x += AnimationEditor.frameSize;
        }
        //cursor
        UI_I.currentDrawBatch.fillBatch.addRect(this.cursorLineRect, this.cursorColor);
        UI_I.currentDrawBatch.fillBatch.addRect(this.cursorRect, this.cursorColor);
        UI_I.currentDrawBatch.textBatch.addLine(this.cursorTextPos, this.cursorText, 1000, this.cursorTextColor)

        /*AnimationEditor.root?.drawUI()

        /*let p =new Vec2(40,40);
        p.add(this.layoutRect.pos);
        UI_I.currentDrawBatch.fillBatch.addKeyframe(p, new Color(1,1,1));*/

    }

    setSubComponents() {
        super.setSubComponents();
        //  AnimationEditor.root?.drawUI()


        if (UI_IC.buttonBase("+ Key", true, this.addKeySettings)) AnimationEditor.addKeysSelected()
        if (UI_IC.buttonBase("+ Key all", true, this.addKeyAllSettings)) AnimationEditor.addKeysAll()
        if (AnimationEditor.isPlaying) {
            if (UI_IC.buttonBase("Pause", true, this.playPauseSettings)) {
                AnimationEditor.pause();
            }
        } else {
            if (UI_IC.buttonBase("Play", true, this.playPauseSettings)) {
                AnimationEditor.play();
            }
        }
        if (AnimationEditor.isRecording) {
            if (UI_IC.buttonBase("Stop Rec", true, this.stopRecordSettings)) {
                AnimationEditor.isRecording = false;
            }
        } else {
            if (UI_IC.buttonBase("Start Rec", true, this.startRecordSettings)) {
                AnimationEditor.isRecording = true;
            }
        }
        UI_IC.pushComponent("threeHolder", this.threeHolderSetting)

        AnimationEditor.drawUITree()

        UI_I.popComponent();
        UI_IC.pushVerticalLayout("keyframes", this.keyFrameSettings);
        AnimationEditor.drawKeyFrames()
        UI_I.popComponent();
        // UI_IC.buttonBase("test2",true,this.testSettings2);
    }


}
