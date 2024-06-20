import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";

import {MenuBGColor, PanelRadius, TextColorBright} from "./Style.ts";
import {addInputText} from "./InputText.ts";




export function setNewPopup(title:string) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()
    let width =400
    let height =200
    settings.box.size.set(width,height)
    settings.box.marginLeft =UI_I.pixelSize.x/2 -width/2;
    settings.box.marginTop =UI_I.pixelSize.y/2-height/2;

    let compPopup = new NewPopup(
        UI_I.getID("colorPopup"),
        settings,title
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export  class NewPopup extends PopUp{
    private title: string;
    private text: string;


    constructor(id:number, settings:PopUpSettings,title:string) {
        super(id,settings);
        this.title =title;
        this.text = "mijnText"

    }
    prepDraw() {
        //super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,PanelRadius)
        UI_I.currentDrawBatch.sdfBatch.addLine(this.layoutRect.pos,this.title,14,TextColorBright,false);
    }
setSubComponents() {
    super.setSubComponents();
    addInputText("mijnText",this,"text" ,10,30)
}

}
