import Component, {ComponentSettings} from "../../lib/UI/components/Component.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import Vec2 from "../../lib/UI/math/Vec2.ts";
import Color from "../../lib/UI/math/Color.ts";
import AnimationEditor from "./AnimationEditor.ts";
import AnimationChannel from "./animation/AnimationChannel.ts";


export default class UIKeyFrameData {

    frames: Array<number> = [];
    public children: Array<UIKeyFrameData> = [];
    public parent: UIKeyFrameData | null = null;
    startDragFrame: number = -1;
    isDrawDirty: boolean = false;

    moveFrame = -1
    selectedFrame = -1;
    channel: AnimationChannel | null = null

    constructor() {

    }

    destroy() {
        this.children = []
        this.parent = null;
        this.channel = null
    }

    clearAllSelectFrames() {
        this.selectedFrame = -1
        for (let child of this.children) {
            child.clearAllSelectFrames()
        }
    }

    addChild(child: UIKeyFrameData) {
        this.children.push(child)
        child.parent = this;
    }

    addKey(frame: number) {
        if (!this.frames.includes(frame)) {
            this.frames.push(frame)
            if (this.parent) this.parent.addKey(frame)
        }
    }

    removeKeyChilds(remove: number) {

        let k = this.frames.indexOf(remove)
        if (k >= 0) {
            this.frames.splice(k, 1)
            for (let child of this.children) {
                child.removeKeyChilds(remove)
            }
        }


        //if (!this.frames.includes(add)) {
        //      this.frames.push(frame)
        //      if(this.parent)this.parent.addKey(frame)
        //  }
    }

    setMoveFrame(frame: number, first: boolean = true) {
        if (this.startDragFrame < 0) return;
        if (this.moveFrame != frame) {

            this.moveFrame = frame;
            this.isDrawDirty = true;
            for (let child of this.children) {
                child.setMoveFrame(frame, false)
            }
        }
    }

    startMove(frame: number, first: boolean = true) {
        if (!this.frames.includes(frame)) return
        if (first) AnimationEditor.clearAllSelectFrames()
        this.startDragFrame = frame;
        for (let child of this.children) {
            child.startMove(frame, false)
        }
    }

    endMove(frame: number, first: boolean = true) {
        if (this.startDragFrame < 0) return;
        if (this.startDragFrame == frame) {
            if (first) AnimationEditor.clearAllSelectFrames()
            this.selectedFrame = frame;

            this.isDrawDirty = true;

        } else {
            console.log("move", this.startDragFrame, "-->", frame)
            if (this.channel) this.channel.moveFrame(this.startDragFrame, frame);
            this.removeKeyChilds(this.startDragFrame)
            this.addKey(frame)
            if (first) {
                if (this.parent) {
                    this.parent.checkIfChildHasKey(this.startDragFrame);
                }
            }
        }


        this.startDragFrame = -1;
        this.moveFrame = -1;
        for (let child of this.children) {
            child.endMove(frame, false)
        }

    }

    private checkIfChildHasKey(remove: number) {
        for (let child of this.children) {
            if (child.frames.includes(remove)) {
                return;
            }
        }
        console.log(remove)
        let k = this.frames.indexOf(remove)
        if (k >= 0) {
            this.frames.splice(k, 1)
            if (this.parent) {
                this.parent.checkIfChildHasKey(remove);
            }
        }
    }


}



export function UIKeyFrames(id: string, keyData: UIKeyFrameData,offset:number) {
    if (!UI_I.setComponent(id)) {
        let componentSettings =new ComponentSettings();
        componentSettings.box.marginLeft=offset;
        componentSettings.box.size.y = 20;
        let comp = new KeyFramesComp(UI_I.getID(id),componentSettings, keyData);
        UI_I.addComponent(comp);
    }
    UI_I.popComponent();
}

class KeyFramesComp extends Component {
    private keyData: UIKeyFrameData;
    private tempStart: Vec2 = new Vec2()
    private temp: Vec2 = new Vec2()
    private frameColor = new Color(1, 1, 1, 0.7)
    private frameColorStartDrag = new Color(1, 1, 1, 0.1)
    private moveFrameColor = new Color(1, 0.5, 0)
    private isDragging: boolean = false;


    constructor(id: number,componentSettings:ComponentSettings, keyData: UIKeyFrameData) {
        super(id,componentSettings)
        this.keyData = keyData;
    }

    onAdded() {
        super.onAdded();
        if (this.keyData.isDrawDirty) {
            this.setDirty()
        }
    }

    onMouseDown() {
        super.onMouseDown();
        this.tempStart.copy(UI_I.mouseListener.mousePos)
        this.tempStart.sub(this.layoutRect.pos)
        let frame = Math.floor((this.tempStart.x + 5) / 10)

        if (this.keyData.frames.includes(frame)) {
            this.keyData.startMove(frame);

            this.isDragging = true;
            this.keyData.setMoveFrame(frame)
        }
        // this.mousePos.add(this.layoutRect.pos)

    }

    updateOnMouseDown() {
        super.updateOnMouseDown();
        if (!this.isDragging) return;

        this.tempStart.copy(UI_I.mouseListener.mousePos)
        this.tempStart.sub(this.layoutRect.pos)
        let moveFrame = Math.floor((this.tempStart.x + 5) / 10)
        this.keyData.setMoveFrame(moveFrame)

    }

    onMouseUp() {
        super.onMouseUp();
        if (!this.isDragging) return;
        this.isDragging = false;

        this.tempStart.copy(UI_I.mouseListener.mousePos)
        this.tempStart.sub(this.layoutRect.pos)
        let frame = Math.floor((this.tempStart.x + 5) / 10)
        this.keyData.endMove(frame);
        this.keyData.setMoveFrame(-1)

        // this.mousePos.add(this.layoutRect.pos)

    }

    prepDraw() {
        super.prepDraw();
        if (this.keyData.frames.length == 0) return;
        this.tempStart.copy(this.layoutRect.pos)
        this.tempStart.y += 8
        for (let frame of this.keyData.frames) {
            this.temp.copy(this.tempStart)
            this.temp.x += frame * 10;
            if (frame == this.keyData.startDragFrame) {
                UI_I.currentDrawBatch.fillBatch.addKeyframe(this.temp, this.frameColorStartDrag);
            } else {
                UI_I.currentDrawBatch.fillBatch.addKeyframe(this.temp, this.frameColor);
            }
        }
        if (this.keyData.moveFrame > -1) {
            this.temp.copy(this.tempStart)
            this.temp.x += this.keyData.moveFrame * 10;

            UI_I.currentDrawBatch.fillBatch.addKeyframe(this.temp, this.moveFrameColor);
        }
        if (this.keyData.selectedFrame > -1) {
            this.temp.copy(this.tempStart)
            this.temp.x += this.keyData.selectedFrame * 10;

            UI_I.currentDrawBatch.fillBatch.addKeyframe(this.temp, this.moveFrameColor);
        }
    }


}
