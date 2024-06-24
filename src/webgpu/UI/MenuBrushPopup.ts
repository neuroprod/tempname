import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {MenuBGColor} from "./Style.ts";

import {popPanelMenu, pushPanelMenu} from "./PanelMenu.ts";

import {addMenuBrushButtonPopup, MenuBrushButton} from "./MenuBrushButton.ts";
import {LineData} from "../modelMaker/drawing/Drawing.ts";


export function setSelectBrushPopup(
    brushBtn: MenuBrushButton
) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()

    settings.box.size.set(320, 53)
    settings.box.marginTop = brushBtn.layoutRect.pos.y + 45
    settings.box.paddingTop = 10
    settings.box.marginLeft = brushBtn.layoutRect.pos.x - 330 / 2 + 20;
    let compPopup = new SelectBrushPopup(
        UI_I.getID("brushPopup"),
        settings, brushBtn
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export default class SelectBrushPopup extends PopUp {

    private btn: MenuBrushButton;
    private lineDatas: Array<LineData> = []

    constructor(id: number, settings: PopUpSettings, brushBtn: MenuBrushButton) {
        super(id, settings);
        this.btn = brushBtn;
        this.lineDatas.push(
            new LineData(1, 1, 0.9),
            new LineData(2, 2, 0.8),
            new LineData(3, 3, 0.3),
            new LineData(4, 4, 0.3),
            new LineData(5, 5, 0.2),
            new LineData(7, 7, 0.2),
            new LineData(10, 10, 0.1),
            new LineData(20, 14, 0.1),

        );
    }

    prepDraw() {

        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, MenuBGColor, 10)
    }

    setSubComponents() {
        super.setSubComponents();

        pushPanelMenu("brush")
        for (let lineData of this.lineDatas) {
            if (addMenuBrushButtonPopup(lineData)) {
                this.btn.lineData.copy(lineData);
                this.btn.setDirty()
                UI_I.removePopup(this);
            }
        }


        popPanelMenu()


    }

}
