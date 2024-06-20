import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";

import {MenuBGColor, PanelRadius, TextColorBright, TextColorDefault} from "./Style.ts";
import {addInputText} from "./InputText.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import {addMainMenuTextButton} from "./MainMenuTextButton.ts";
import {addIconButton, addMainMenuButton} from "./MainMenuButton.ts";
import {Icons} from "./Icons.ts";




export function setNewPopup(title: string, defaultName: string, callBack: (name: string) => void) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()
    let width =320
    let height =100
    settings.box.size.set(width,height)
    settings.box.marginLeft =UI_I.pixelSize.x/2 -width/2;
    settings.box.marginTop =UI_I.pixelSize.y/2-height/2;

    let compPopup = new NewPopup(
        UI_I.getID("colorPopup"),
        settings,title,defaultName,callBack
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export  class NewPopup extends PopUp{
    private title: string;
    private text: string;
    private textPos=new Vec2();
    private callBack:(string) => void;
    constructor(id:number, settings:PopUpSettings,title:string,defaultName:string, callBack:(name:string) => void) {
        super(id,settings);
        this.title =title;
        this.text = defaultName;
        this.callBack =callBack;
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        this.textPos.copy(this.layoutRect.pos)
        this.textPos.x+=25
        this.textPos.y+=10
    }

    prepDraw() {
        //super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,PanelRadius)
        UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos,this.title,14,TextColorDefault,false);
    }
    setSubComponents() {
        super.setSubComponents();
        if(addIconButton("add",Icons.NEXT,true,225,35,35,true)){
            this.callBack(this.text);
            UI_I.removePopup(this);
        }
        if(addIconButton("close",Icons.CLOSE,true,265,35,35)){
            UI_I.removePopup(this);
        }
        addInputText("new_image",this,"text" ,20,35)
        //addIconButton("add",Icons.NEW_IMAGE,true,100,35,35)
    }

}
