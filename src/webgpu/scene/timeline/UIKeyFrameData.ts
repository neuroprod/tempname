import Component, {ComponentSettings} from "../../lib/UI/components/Component.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import Vec2 from "../../lib/UI/math/Vec2.ts";
import Color from "../../lib/UI/math/Color.ts";


export default class UIKeyFrameData {

    frames: Array<number> = [];
    public children:Array<UIKeyFrameData> = [];
    public parent:UIKeyFrameData |null =null;
    constructor() {

    }
    addChild(child:UIKeyFrameData){
        this.children.push(child)
        child.parent =this;
    }
    addKey(frame: number) {
        if (!this.frames.includes(frame)) {
            this.frames.push(frame)
            if(this.parent)this.parent.addKey(frame)
        }
    }

}

class KeyFramesCompSetting extends ComponentSettings {
    constructor() {
        super();
        this.box.size.y = 16;
        this.box.marginBottom = 2;
        this.hasBackground = true;
        this.backgroundColor.setHex("#000000", 0.1)
    }

}

export function UIKeyFrames(id: string, keyData: UIKeyFrameData) {
    if (!UI_I.setComponent(id)) {
        let comp = new KeyFramesComp(UI_I.getID(id), keyData);
        UI_I.addComponent(comp);
    }
    UI_I.popComponent();
}

class KeyFramesComp extends Component {
    private keyData: UIKeyFrameData;
    private tempStart: Vec2 = new Vec2()
    private temp: Vec2 = new Vec2()
    private frameColor = new Color(1, 1, 1)

    constructor(id, keyData: UIKeyFrameData) {
        super(id, new KeyFramesCompSetting())
        this.keyData = keyData;
    }

    prepDraw() {
        super.prepDraw();
        if(this.keyData.frames.length==0)return;
        this.tempStart.copy(this.layoutRect.pos)
        this.tempStart.y+=8
        for (let frame of this.keyData.frames) {
            this.temp.copy(this.tempStart)
            this.temp.x += frame * 10;

            UI_I.currentDrawBatch.fillBatch.addKeyframe(this.temp, this.frameColor);
        }
    }


}
