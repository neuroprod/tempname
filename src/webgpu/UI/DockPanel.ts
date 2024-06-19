
import UI_I from "../lib/UI/UI_I.ts";

import {MenuBGColor} from "./Style.ts";


import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";


export function pushDockPanel(name:string){


    UI_I.currentComponent = UI_I.panelLayer;
    if (!UI_I.setComponent(name)) {

        let s = new ComponentSettings()
console.log("addComp")
        s.box.size.set(200,200)
        s.box.setMargin(10)
        //s.box.setPadding(5);
        //s.box.paddingLeft=3;
        //s.box.paddingRight=3;



        let comp = new DockPanel(UI_I.getID(name), s);
        UI_I.addComponent(comp);
    }


}
export function popDockPanel(){

    UI_I.popComponent()
}


class DockPanel extends Component{


    constructor(id:number,s:ComponentSettings) {

        super(id,s);
    }



    layoutRelative() {
        super.layoutRelative();
        console.log(this.layoutRect)
       // this.posOffset.set(this.screenSize.x/2-this.size.x/2,10)
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        console.log(this.layoutRect)

    }

    prepDraw() {
        super.prepDraw();
        console.log(this.layoutRect)
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,12)
    }


}
