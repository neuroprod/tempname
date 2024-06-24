import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";


import {TextColorBright, TextColorDefault,} from "./Style.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {LineData} from "../modelMaker/drawing/Drawing.ts";

import {setSelectBrushPopup} from "./MenuBrushPopup.ts";
import Color from "../lib/UI/math/Color.ts";

export function addMenuBrushButtonPopup(lineData: LineData) {


    let id = lineData.uiRadius + " " + lineData.lineSize;

    if (!UI_I.setComponent(id)) {

        let s = new ComponentSettings()

        s.box.size.set(33, 33)
        s.box.setMargin(0)
        s.box.marginLeft = 2;
        s.box.marginRight = 2;
        s.box.setPadding(0);

        let col = new Color().setHex(id)

        let comp = new MenuBrushButton(UI_I.getID(id), s, lineData);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MenuBrushButton;

    UI_I.popComponent()
    return r.getReturnValue();
}


export function addMenuBrushButton(id: string, lineData: LineData) {


    if (!UI_I.setComponent(id)) {

        let s = new ComponentSettings()

        s.box.size.set(33, 33)
        s.box.setMargin(0)
        s.box.marginLeft = 2;
        s.box.marginRight = 2;
        s.box.setPadding(0);


        let comp = new MenuBrushButton(UI_I.getID(id), s, lineData);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MenuBrushButton;

    if (r.getReturnValue()) {
        setSelectBrushPopup(r)
    }

    UI_I.popComponent()
    return r.getReturnValue();
}


export class MenuBrushButton extends Component {


    public colorRect: Rect = new Rect();

    public lineData: LineData;

    constructor(id: number, s: ComponentSettings, lineData: LineData) {

        super(id, s);
        this.lineData = lineData;



    }

    destroy() {
        super.destroy();
        //TODO cleanup refs, check every component
    }

    layoutRelative() {
        super.layoutRelative();

    }

    layoutAbsolute() {
        super.layoutAbsolute();


        this.colorRect.pos.copy(this.layoutRect.pos);
        this.colorRect.pos.x += this.layoutRect.size.x / 2 -  this.lineData.uiRadius;
        this.colorRect.pos.y += this.layoutRect.size.y / 2 -   this.lineData.uiRadius;
        this.colorRect.size.x = this.lineData.uiRadius * 2;
        this.colorRect.size.y = this.lineData.uiRadius * 2;

    }

    prepDraw() {
        super.prepDraw();
        // UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect,ButtonBorderColor,6+1)
        if(this.isOver){
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.colorRect, TextColorBright,  this.lineData.uiRadius)

        }else{

            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.colorRect, TextColorDefault,  this.lineData.uiRadius)
        }



    }


    getReturnValue(): any {

        return this.isClicked;
    }
}
