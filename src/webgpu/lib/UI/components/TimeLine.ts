import Component, {ComponentSettings} from "./Component.ts";

import TimeLineEditor from "../../../scene/timeline/TimeLineEditor.ts";

import UI_I from "../UI_I.ts";
import Color from "../math/Color.ts";
import Rect from "../math/Rect.ts";

import Vec2 from "../math/Vec2.ts";
import UI_IC from "../UI_IC.ts";
import UI from "../UI.ts";
import {ButtonBaseSettings} from "./internal/ButtonBase.ts";

export class TimeLineSettings extends ComponentSettings
{
    constructor() {
        super();
        this.box.size.set(-1,-1)
    }

}
export default class TimeLine extends Component{
    private editor: TimeLineEditor;
    private mousePos =new Vec2()
    private testSettings: ButtonBaseSettings;
    private testSettings2: ButtonBaseSettings;
    constructor(id: number, editor:TimeLineEditor, settings: TimeLineSettings) {
                super(id,settings)
                this.editor =editor;
                this.testSettings =new ButtonBaseSettings()
                this.testSettings.box.size.set(100,20)
                this.testSettings2 =new ButtonBaseSettings()
                this.testSettings2.box.size.set(100,20)
        this.testSettings2.box.marginLeft=105


    }
    onMouseDown() {
        super.onMouseDown();
        this.mousePos.copy(UI_I.mouseListener.mousePos)
        this.mousePos.add(this.layoutRect.pos)
        console.log("down")
    }
    onMouseUp() {
        super.onMouseUp();
        this.mousePos.copy(UI_I.mouseListener.mousePos)
        this.mousePos.add(this.layoutRect.pos)
        console.log("up")
    }
    updateOnMouseDown() {
        super.updateOnMouseDown();
        this.mousePos.copy(UI_I.mouseListener.mousePos)
        this.mousePos.add(this.layoutRect.pos)
        console.log("move")
    }


    onAdded() {

        super.onAdded();
        if(this.editor.isDrawDirty)
        {
            this.setDirty()
            this.editor.isDrawDirty =false;
        }
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, new Color(0.3,0.3,0.3));

        let r =new Rect()
        r.size.set(1,this.layoutRect.size.y)
        r.pos.y=this.layoutRect.pos.y;
        for(let i=1;i<=this.editor.numFrames;i++){
            r.pos.x =this.layoutRect.pos.x+i*10;

            UI_I.currentDrawBatch.fillBatch.addRect(r, new Color(0.2,0.2,0.2));
        }
        let p =new Vec2(40,40);
        p.add(this.layoutRect.pos);
        UI_I.currentDrawBatch.fillBatch.addKeyframe(p, new Color(1,1,1));

    }
    setSubComponents() {
        super.setSubComponents();
        UI_IC.buttonBase("test",true,this.testSettings);
        
         UI_IC.buttonBase("test2",true,this.testSettings2);
    }


}
