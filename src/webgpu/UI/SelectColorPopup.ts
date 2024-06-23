import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {MenuBGColor, PanelRadius} from "./Style.ts";
import UI_IC from "../lib/UI/UI_IC.ts";
import {addMenuColorButton, addMenuColorButtonPopup} from "./MenuColorButton.ts";
import UI from "../lib/UI/UI.ts";
import Color from "../lib/UI/math/Color.ts";
import {ColorPickerSettings} from "../lib/UI/components/internal/ColorPicker.ts";
import {popPanelMenu, pushPanelMenu} from "./PanelMenu.ts";




export function setSelectColorPopup(
  rect:Rect
) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()

    settings.box.size.set(330,320)
    settings.box.marginTop =rect.pos.y+45
    settings.box.paddingTop =10
    settings.box.marginLeft =rect.pos.x-330/2+20;
    let compPopup = new SelectColorPopup(
        UI_I.getID("colorPopup"),
        settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export default class SelectColorPopup extends PopUp{
    private color: Color;
    private colorPickerSettings: ColorPickerSettings;


constructor(id:number, settings:PopUpSettings) {
    super(id,settings);
    this.color =new Color()
    this.colorPickerSettings =new ColorPickerSettings()
    this.colorPickerSettings.box.setMargin(10)
    this.colorPickerSettings.box.marginTop=40
}
prepDraw() {
    //super.prepDraw();
    UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,MenuBGColor,10)
}
    setSubComponents() {
        super.setSubComponents();
       // UI_IC.pushVerticalLayout("v");
        pushPanelMenu("color")

        addMenuColorButtonPopup("#261002")
        addMenuColorButtonPopup("#FFFFFF")
        addMenuColorButtonPopup("#ff5050")
        popPanelMenu()
        //UI_I.popComponent();

        UI_IC.colorPicker( "colorPick",this.color,this.colorPickerSettings)

    }

}
