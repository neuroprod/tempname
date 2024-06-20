import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {MenuBGColor, PanelRadius} from "./Style.ts";
import UI_IC from "../lib/UI/UI_IC.ts";
import {addMenuColorButton, addMenuColorButtonPopup} from "./MenuColorButton.ts";




export function setSelectColorPopup(
  rect:Rect
) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()
    let width =33+4
    settings.box.size.set(width,150)
    settings.box.marginTop =rect.pos.y
    settings.box.marginLeft =rect.pos.x-2;
    let compPopup = new SelectColorPopup(
        UI_I.getID("colorPopup"),
        settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export default class SelectColorPopup extends PopUp{


constructor(id:number, settings:PopUpSettings) {
    super(id,settings);
}
prepDraw() {
    //super.prepDraw();
    UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,10)
}
    setSubComponents() {
        super.setSubComponents();
        UI_IC.pushVerticalLayout("v");
        addMenuColorButtonPopup("#FF0000")
        addMenuColorButtonPopup("#261002")
        addMenuColorButtonPopup("#FFFFFF")
        addMenuColorButtonPopup("#FF00FF")
        UI_I.popComponent();
    }

}
