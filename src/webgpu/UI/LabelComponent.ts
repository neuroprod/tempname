import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {TextColorDefault, TextColorDisabled} from "./Style.ts";

export function pushLabel(label:string){


    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(-1,30)
        s.box.setMargin(2)
        s.box.marginLeft =8
        s.box.marginRight =8
        s.box.setPadding(0);
        s.box.paddingLeft =70;
        //s.hasBackground =true;

        let comp = new LabelComponent(UI_I.getID(label),label,s);
        UI_I.addComponent(comp);
    }





}
export function popLabel(){
    UI_I.popComponent()
}

export default class LabelComponent extends Component {

    protected label: string;

    private labelPos = new Vec2();


    constructor(id: number, label: string, settings: ComponentSettings) {
        super(id, settings);
        this.label = label;

    }

    layoutAbsolute() {
        if (!this.label.length) return;




        this.labelPos.copy(this.layoutRect.pos);
        this.labelPos.y+=this.layoutRect.size.y/2 -6

    }





    prepDraw() {
        super.prepDraw();
        if (!this.label.length) return;


        UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,12,TextColorDisabled);

    }


}
