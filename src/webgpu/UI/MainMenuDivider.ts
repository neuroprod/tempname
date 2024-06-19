import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";

import {
    ButtonColor,
    ButtonRadius, MenuDividerColor, OverButtonColor,
    SelectButtonColor,
    TextColorDefault,
    TextColorDisabled,
    TextColorSelect
} from "./Style.ts";



export function addMainMenuDivider(label:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(1,22)
        s.box.setMargin(0)
        s.box.marginTop=5;
        s.box.marginLeft =8;
        s.box.marginRight =8;
        s.box.setPadding(0);



        let comp = new MainMenuDivider(UI_I.getID(label),s);
        UI_I.addComponent(comp);
    }


    UI_I.popComponent()

}



class MainMenuDivider extends Component{


    constructor(id:number,s:ComponentSettings) {

        super(id,s);


    }

    layoutRelative() {
        super.layoutRelative();

    }
    layoutAbsolute() {
        super.layoutAbsolute();

    }

    prepDraw() {
        super.prepDraw();

            UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect,MenuDividerColor)



    }



}
