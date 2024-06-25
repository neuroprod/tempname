
import UI_I from "../lib/UI/UI_I.ts";

import {MenuBGColor, PanelRadius, TextColorDefault} from "./Style.ts";


import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import SplitNode from "./SplitNode.ts";
import UI_IC from "../lib/UI/UI_IC.ts";
import {VerticalLayoutSettings} from "../lib/UI/components/VerticalLayout.ts";
import DefaultTextures from "../lib/textures/DefaultTextures.ts";
import Renderer from "../lib/Renderer.ts";

export function pushSplitPanelFixed(name:string,x:number=10,y:number=70,sizeX:number=300,sizeY:number=300,needsScroll=true){


    UI_I.currentComponent = UI_I.panelLayer;
    if (!UI_I.setComponent(name)) {

        let s = new ComponentSettings()

        s.box.size.set(sizeX,sizeY)
        s.box.marginTop =y
        s.box.marginLeft =x
        s.box.setPadding(14);
        s.box.paddingLeft = 0;
        s.box.paddingRight = 0;
        s.box.paddingBottom= 15;
        if(!needsScroll) {
            s.box.paddingTop= 15;
            s.box.paddingBottom= 25;
        }


        let comp = new SplitPanel(UI_I.getID(name), s,null,name,needsScroll);
        UI_I.addComponent(comp);
    }


}
export function pushSplitPanel(name:string,splitNode:SplitNode|null=null,needsScroll=true){


    UI_I.currentComponent = UI_I.panelLayer;
    if (!UI_I.setComponent(name)) {

        let s = new ComponentSettings()

        s.box.size.set(200,200)
        s.box.setMargin(0)
        s.box.setPadding(14);
        s.box.paddingLeft = 0;
        s.box.paddingRight = 0;
        s.box.paddingBottom= 15;
        if(!needsScroll) {
            s.box.paddingTop= 15;
            s.box.paddingBottom= 25;
       }


        let comp = new SplitPanel(UI_I.getID(name), s,splitNode,name,needsScroll);
        UI_I.addComponent(comp);
    }


}
export function popSplitPanel(){

    UI_I.popComponent()
}


export class SplitPanel extends Component{
    private name: string;
    private contentVLSetting: VerticalLayoutSettings;


    constructor(id:number,s:ComponentSettings,splitNode:SplitNode|null,name:string,needsScroll:boolean) {

        super(id,s);
        if(splitNode) splitNode.setPanel(this);

        this.name =name;
        this.hasOwnDrawBatch =true
       // this.splitNode =splitNode;
        this.contentVLSetting = new VerticalLayoutSettings();
        this.contentVLSetting.needScrollBar =needsScroll
        this.contentVLSetting.box.marginTop = 0;

    }



    layoutRelative() {
        super.layoutRelative();


    }
    layoutAbsolute() {
        super.layoutAbsolute();


    }

    prepDraw() {
        super.prepDraw();

        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,PanelRadius)


    }
    setSubComponents() {


        UI_IC.pushVerticalLayout("panelVert", this.contentVLSetting);


    }

}
