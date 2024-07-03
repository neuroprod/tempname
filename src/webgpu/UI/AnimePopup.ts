import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";

import {ButtonColor, MenuBGColor, PanelRadius, TextColorDefault} from "./Style.ts";

import Vec2 from "../lib/UI/math/Vec2.ts";
import {VerticalLayoutSettings} from "../lib/UI/components/VerticalLayout.ts";
import UI_IC from "../lib/UI/UI_IC.ts";
import Project from "../data/Project.ts";
import {addListButton} from "./ListButton.ts";
import Animation from "../sceneEditor/timeline/animation/Animation.ts";






export function setAnimePopup(title: string, items:Array<Animation>, callBack: (item:any) => void) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()
    let width =330
    let height =200
    settings.box.size.set(width,height)
    settings.box.marginLeft =UI_I.pixelSize.x/2 -width/2;
    settings.box.marginTop =UI_I.pixelSize.y/2-height/2;
    settings.box.paddingBottom =25;
    settings.box.paddingTop =40;
    let compPopup = new AnimePopup(
        UI_I.getID("colorPopup"),
        settings,title,items,callBack
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export  class AnimePopup extends PopUp{
    private title: string;

    private textPos=new Vec2();
    private callBack:(item:Animation) => void;
    private vlSettings: VerticalLayoutSettings;
    private items: Array<Animation>;
    constructor(id:number, settings:PopUpSettings,title:string,items:Array<Animation>, callBack: (item:Animation) => void) {
        super(id,settings);
        this.title =title;

        this.vlSettings = new VerticalLayoutSettings();

      //  this.vlSettings.box.marginTop =45
        //this.vlSettings.box.marginBottom =30
        ///this.vlSettings.box.size.y =150;
     this.vlSettings.hasBackground =true;
        this.vlSettings.backgroundColor.copy(ButtonColor)
        this.vlSettings.needScrollBar = true;
        this.items = items;

        this.callBack =callBack;
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        this.textPos.copy(this.layoutRect.pos)
        this.textPos.x+=25
        this.textPos.y+=15
    }

    prepDraw() {
        //super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,PanelRadius)
        UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos,this.title,14,TextColorDefault,false);
    }
    setSubComponents() {
        super.setSubComponents();
        UI_IC.pushVerticalLayout("vl", this.vlSettings);
        for(let item of this.items){

                 if(   addListButton(item.label)){
                     this.callBack(item);
                     UI_I.removePopup(this);
                 }

        }


        UI_I.popComponent();

    }

}
