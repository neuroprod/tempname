


import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";

import {ButtonColor, MenuBGColor, PanelRadius, TextColorDefault} from "./Style.ts";

import Vec2 from "../lib/UI/math/Vec2.ts";
import {VerticalLayoutSettings} from "../lib/UI/components/VerticalLayout.ts";
import UI_IC from "../lib/UI/UI_IC.ts";
import Project from "../data/Project.ts";
import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import {addMainMenuTextButton, addTextButton} from "./MainMenuTextButton.ts";
import UI from "../lib/UI/UI.ts";







export function addMeshPopup(title: string,  callBack: (item:SceneObject3D) => void) {
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
    let compPopup = new AddMeshPopup(
        UI_I.getID("colorPopup"),
        settings,title,callBack
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export  class AddMeshPopup extends PopUp{
    private title: string;

    private textPos=new Vec2();
    private callBack: (item:SceneObject3D) => void
    private vlSettings: VerticalLayoutSettings;

    constructor(id:number, settings:PopUpSettings,title:string, callBack: (item:SceneObject3D) => void) {
        super(id,settings);
        this.title =title;

        this.vlSettings = new VerticalLayoutSettings();

        //  this.vlSettings.box.marginTop =45
        //this.vlSettings.box.marginBottom =30
        ///this.vlSettings.box.size.y =150;

        this.vlSettings.needScrollBar =false


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
        addTextButton("add Empty")

       UI.separator("s1",false)

        addTextButton("add Mesh")

        UI.separator("s2",false)
        addTextButton("add Text")
      /*  for(let item of this.items){

            if(   addListButton(item.name)){
                this.callBack(item);
                UI_I.removePopup(this);
            }

        }*/


        UI_I.popComponent();

    }

}
