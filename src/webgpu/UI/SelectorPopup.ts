import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import {ButtonBaseSettings} from "../lib/UI/components/internal/ButtonBase.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import UI_I from "../lib/UI/UI_I.ts";
import UI_IC from "../lib/UI/UI_IC.ts";
import {ButtonBorderColor, ButtonColor, InputTextRadius, TextColorBright, TextColorDefault} from "./Style.ts";
import {VerticalLayoutSettings} from "../lib/UI/components/VerticalLayout.ts";
import {Icons} from "./Icons.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {addSelectorListButton} from "./ListButton.ts";

export function addSelectorPopup(
    callBack: (item: SelectItem) => void,
    pos: Vec2,
    targetWidth = -1,
    items: Array<SelectItem>,
    index = 0,
    settings: PopUpSettings = new PopUpSettings()
) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let compPopup = new SelectorPopUp(
        UI_I.getID("select"),
        callBack,
        pos,
        targetWidth,
        items,
        index,
        settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}

export default class SelectorPopUp extends PopUp {
    private items: Array<SelectItem>;
    private btnSettings: ButtonBaseSettings;
    private callBack: (item: SelectItem) => void;
    private index: number;

    private vsettings: VerticalLayoutSettings;
    private label: string;
    private itemSize: number;
    private textPos = new Vec2()
    private iconPos = new Vec2()
    private textRect = new Rect();

    constructor(
        id: number,
        callBack: (item: SelectItem) => void,
        pos: Vec2,
        targetWidth = -1,
        items: Array<SelectItem>,
        index = 0,
        settings: PopUpSettings
    ) {
        super(id, settings);
        this.itemSize = 33;
        this.posOffset = pos;
        let maxSize = UI_I.screenSize.y - pos.y - 10;
        this.size.set(targetWidth, Math.min(this.itemSize * items.length + InputTextRadius, maxSize));
        this.settings.box.size.copy(this.size);
        this.items = items;
        this.btnSettings = new ButtonBaseSettings();
        this.btnSettings.box.size.y = this.itemSize;
        this.btnSettings.backColor.a = 0;


        this.callBack = callBack;
        this.index = index;

        this.vsettings = new VerticalLayoutSettings()
        this.vsettings.box.marginTop = this.itemSize;
        this.vsettings.box.marginBottom = InputTextRadius;


        this.label = this.items[index].label
    }

    setSubComponents() {
        super.setSubComponents();
        if (this.isClicked) {
            UI_I.removePopup(this);
        }
        UI_IC.pushVerticalLayout("v", this.vsettings);


        for (let i = 0; i < this.items.length; i++) {
            if (i == this.index) continue;

            if (addSelectorListButton(this.items[i].label)) {
                this.callBack(this.items[i]);
                UI_I.removePopup(this);
            }
        }
        UI_I.popComponent();
    }

    layoutAbsolute() {

        this.textPos.x = this.layoutRect.pos.x + 10;
        this.textPos.y = this.layoutRect.pos.y + this.itemSize / 2 - 7;

        this.textRect.copy(this.layoutRect);
        this.textRect.size.x -= 2;
        this.textRect.size.y -= 2;
        this.textRect.pos.x += 1;
        this.textRect.pos.y += 1;

        this.iconPos.copy(this.layoutRect.pos)
        this.iconPos.x += this.layoutRect.size.x - this.itemSize / 2;
        this.iconPos.y += this.itemSize / 2;
    }

    prepDraw() {
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, ButtonBorderColor, InputTextRadius);
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.textRect, ButtonColor, InputTextRadius - 1);
        // super.prepDraw();
        UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos, this.label, 14, TextColorDefault);
        UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos, Icons.DOWN_ARROW, 14, TextColorBright);
    }
}
