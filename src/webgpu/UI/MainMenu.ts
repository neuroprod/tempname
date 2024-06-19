import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import {MenuBGColor} from "./Style.ts";

import Rect from "../lib/UI/math/Rect.ts";


export function pushMainMenu(){


    UI_I.currentComponent = UI_I.panelLayer;
    if (!UI_I.setComponent("MainMenu")) {

        let s = new ComponentSettings()

        s.box.size.set(400,50)
        s.box.setMargin(10)
        s.box.setPadding(5);
        s.box.paddingLeft=3;
        s.box.paddingRight=3;



        let comp = new MainMenu(UI_I.getID("MainMenu"), s);
        UI_I.addComponent(comp);
    }


}
export function popMainMenu(){

    UI_I.popComponent()
}


 class MainMenu extends Component{

    screenSize = new Vec2()
     mainSelectRect =new Rect()
    constructor(id:number,s:ComponentSettings) {

        super(id,s);
    }

    onAdded() {
        super.onAdded();
        if(!UI_I.pixelSize.equal(this.screenSize)){
            this.screenSize.copy(UI_I.pixelSize)
           /// console.log(this.screenSize,UI_I.pixelSize)
            this.setDirty()
        }

    }
     updateCursor(comp: Component) {
         this.placeCursor.x +=
             +comp.settings.box.marginLeft +
             comp.size.x +
             comp.settings.box.marginRight;
     }
    layoutRelative() {
        super.layoutRelative();
        //this.posOffset.set(this.screenSize.x/2-this.size.x/2,10)
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        this.mainSelectRect.copy(this.layoutRect)
        this.mainSelectRect.size.x=46*3;
    }

     prepDraw() {
        super.prepDraw();
         UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.mainSelectRect,MenuBGColor,12)
    }


 }
