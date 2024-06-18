import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import {MenuBGColor} from "./Style.ts";


export function pushToolBar(){


    UI_I.currentComponent = UI_I.panelLayer;
    if (!UI_I.setComponent("ToolBar")) {

        let s = new ComponentSettings()
        s.hasBackground =true;
        s.backgroundColor.copy(MenuBGColor)
        s.box.size.set(40,400)
        s.box.setMargin(0)
        s.box.setPadding(0);



        let comp = new ToolBar(UI_I.getID("ToolBar"), s);
        UI_I.addComponent(comp);
    }


}
export function popToolBar(){

    UI_I.popComponent()
}


class ToolBar extends Component{

    screenSize = new Vec2()
    constructor(id:number,s:ComponentSettings) {

        super(id,s);
    }
    onAdded() {
        super.onAdded();


    }
    layoutRelative() {
        super.layoutRelative();
        this.posOffset.set(10,10+50)
    }
    layoutAbsolute() {
        super.layoutAbsolute();
    }

    prepDraw() {
        super.prepDraw();
    }


}
