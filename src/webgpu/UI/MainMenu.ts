import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {MenuBGColor, PanelRadius} from "./Style.ts";

import Rect from "../lib/UI/math/Rect.ts";


export function pushMainMenu(label:string,size:number,offset:number){


    UI_I.currentComponent = UI_I.panelLayer;
    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()
        s.box.size.set(400,52)
        s.box.setMargin(10)
        s.box.setPadding(9);
        let comp = new MainMenu(UI_I.getID(label), s,size,offset);
        UI_I.addComponent(comp);
    }


}
export function popMainMenu(){

    UI_I.popComponent()
}


 class MainMenu extends Component{


     mainSelectRect =new Rect()
     private sizeX: number;
     private offsetX: number;
    constructor(id:number,s:ComponentSettings,size:number,offset:number) {

        super(id,s);
        this.sizeX =size
        this.size.x=size;
        this.offsetX =offset
    }


     updateCursor(comp: Component) {
         this.placeCursor.x +=
             +comp.settings.box.marginLeft +
             comp.size.x +
             comp.settings.box.marginRight;
     }
    layoutRelative() {
        super.layoutRelative();
        this.size.x =this.sizeX
        this.posOffset.x =this.offsetX;
        //this.posOffset.set(this.screenSize.x/2-this.size.x/2,10)
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        this.mainSelectRect.copy(this.layoutRect)

    }

     prepDraw() {
        super.prepDraw();
         UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.mainSelectRect,MenuBGColor,PanelRadius)
    }


 }
