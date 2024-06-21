import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {HAlign} from "../lib/UI/UI_Enums.ts";


export function pushPanelMenu(label:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(300,34)
        s.box.setMargin(0)
        s.box.marginBottom=5
        s.box.setPadding(0);

//s.box.hAlign =HAlign.RIGHT;



        let comp = new PanelMenu(UI_I.getID(label), s);
        UI_I.addComponent(comp);
    }


}
export function popPanelMenu(){

    UI_I.popComponent()
}


class PanelMenu extends Component{



    constructor(id:number,s:ComponentSettings) {

        super(id,s);

    }


    updateCursor(comp: Component) {
        this.placeCursor.x +=
            +comp.settings.box.marginLeft +
            comp.size.x +
            comp.settings.box.marginRight;
    }



}
