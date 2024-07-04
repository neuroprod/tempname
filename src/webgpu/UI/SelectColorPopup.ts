import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {MenuBGColor} from "./Style.ts";
import UI_IC from "../lib/UI/UI_IC.ts";
import {addMenuColorButtonPopup, MenuColorButton} from "./MenuColorButton.ts";
import Color from "../lib/UI/math/Color.ts";
import {ColorPickerSettings} from "../lib/UI/components/internal/ColorPicker.ts";
import {popPanelMenu, pushPanelMenu} from "./PanelMenu.ts";
import ColorButton from "../lib/UI/components/internal/ColorButton.ts";


export function setSelectColorPopup(
    colorBtn: MenuColorButton
) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()

    settings.box.size.set(330, 320)
    settings.box.marginTop = colorBtn.layoutRect.pos.y + 45
    settings.box.paddingTop = 10
    settings.box.marginLeft = colorBtn.layoutRect.pos.x - 330 / 2 + 20;
    let compPopup = new SelectColorPopup(
        UI_I.getID("colorPopup"),
        settings,colorBtn
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export default class SelectColorPopup extends PopUp {
    private color: Color;
    private colorPickerSettings: ColorPickerSettings;
    private btn: MenuColorButton;
    private colors =[
        "#2d1205",
        "#ffffff",
        "#ff7b7b",
        "#eeeeee",
        "#dddddd",
        "#cccccc",
        "#bbbbbb"]

    constructor(id: number, settings: PopUpSettings,colorBtn:MenuColorButton) {
        super(id, settings);
        this.btn =colorBtn;
        this.color = colorBtn.color;
        this.colorPickerSettings = new ColorPickerSettings()
        this.colorPickerSettings.box.setMargin(10)
        this.colorPickerSettings.box.marginTop = 40
    }

    prepDraw() {
        //super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, MenuBGColor, 10)
    }

    setSubComponents() {
        super.setSubComponents();
        // UI_IC.pushVerticalLayout("v");
        pushPanelMenu("color")
        for(let color of this.colors){
            if(addMenuColorButtonPopup(color)){
                this.color.setHex(color);
                this.btn.setDirty()
            }
        }

        //addMenuColorButtonPopup("#FFFFFF")
        //addMenuColorButtonPopup("#ff5050")
        popPanelMenu()
        //UI_I.popComponent();

       if( UI_IC.colorPicker("colorPick", this.color, this.colorPickerSettings)){
           this.btn.setDirty()
       }

    }

}
