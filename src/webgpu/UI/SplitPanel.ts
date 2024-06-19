
import UI_I from "../lib/UI/UI_I.ts";

import {MenuBGColor, TextColorDefault} from "./Style.ts";


import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import SplitNode from "./SplitNode.ts";


export function pushSplitPanel(name:string,splitNode:SplitNode){


    UI_I.currentComponent = UI_I.panelLayer;
    if (!UI_I.setComponent(name)) {

        let s = new ComponentSettings()

        s.box.size.set(200,200)
        s.box.setMargin(0)
        s.box.setPadding(5);
        //s.box.paddingLeft=3;
        //s.box.paddingRight=3;



        let comp = new SplitPanel(UI_I.getID(name), s,splitNode,name);
        UI_I.addComponent(comp);
    }


}
export function popSplitPanel(){

    UI_I.popComponent()
}


export class SplitPanel extends Component{
    private name: string;


    constructor(id:number,s:ComponentSettings,splitNode:SplitNode,name:string) {

        super(id,s);
        splitNode.setPanel(this);
        this.name =name;
        this.hasOwnDrawBatch =true
       // this.splitNode =splitNode;
    }



    layoutRelative() {
        super.layoutRelative();

       // this.posOffset.set(this.screenSize.x/2-this.size.x/2,10)
    }
    layoutAbsolute() {
        super.layoutAbsolute();


    }

    prepDraw() {
        super.prepDraw();

        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,12)
        UI_I.currentDrawBatch.sdfBatch.addLine(this.layoutRect.pos,this.name,16,TextColorDefault)
    }


}