import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {
    ButtonBorderColor,
    ButtonColor,
    InputTextRadius,
    SelectButtonColor,
    SelectorButtonColor,
    TextColorBright,
    TextColorDefault
} from "./Style.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {Icons} from "./Icons.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";

import Utils from "../lib/UI/math/Utils.ts";

import {addSelectorPopup} from "./SelectorPopup.ts";
import Box from "../lib/UI/math/Box.ts";

export function addSelectorBox( label:string, items: Array<SelectItem>,currentIndex: number,box =new Box()) {

    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()
        s.box =box
        let comp = new Selector(UI_I.getID(label), s, items,currentIndex);

        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent.getReturnValue()
    UI_I.popComponent()
    return r;
}
export function addSelector( label:string, items: Array<SelectItem>,currentIndex: number) {

    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        let comp = new Selector(UI_I.getID(label), s, items,currentIndex);

        UI_I.addComponent(comp);
    }


    let r = UI_I.currentComponent.getReturnValue()
    UI_I.popComponent()
    return r;
}

export class Selector extends Component {
    private label: string;
    private textPos = new Vec2()
    private iconPos = new Vec2()
    private textRect = new Rect();
    private buttonRect = new Rect();
    private items: Array<SelectItem>;
    private currentIndex: number;

    constructor(id: number, settings: ComponentSettings, items: Array<SelectItem>,currentIndex: number) {
        super(id, settings);
        this.items =items;
        this.currentIndex = currentIndex;
        this.label = this.items[this.currentIndex].label;
    }
    setSelection(item: SelectItem) {
        this.currentIndex = this.items.indexOf(item);
        this.label = this.items[this.currentIndex].label;
        this.setDirty();
    }

    getReturnValue(): any {
        return this.items[this.currentIndex].value;
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        this.textPos.x = this.layoutRect.pos.x + 10;
        this.textPos.y = this.layoutRect.pos.y + this.layoutRect.size.y / 2 - 7;

        this.textRect.copy(this.layoutRect);
        this.textRect.size.x -= 2;
        this.textRect.size.y -= 2;
        this.textRect.pos.x += 1;
        this.textRect.pos.y += 1;

        this.buttonRect.copy(this.textRect)

        this.buttonRect.pos.x += this.textRect.size.x - this.textRect.size.y;
        this.buttonRect.size.x = this.textRect.size.y;

        this.iconPos.copy(this.buttonRect.pos)
        this.iconPos.x += this.buttonRect.size.x / 2;
        this.iconPos.y += this.buttonRect.size.y / 2;
    }
    setSubComponents() {
        super.setSubComponents();

        if (this.isClicked) {
            let pos = this.layoutRect.pos.clone();
            pos.x += this.settings.box.paddingLeft;
            let width = Utils.getMaxInnerWidth(this);
            addSelectorPopup(
                this.setSelection.bind(this),
                pos,
                width,
                this.items,
                this.currentIndex
            );
        }


    }
    prepDraw() {
        super.prepDraw();
        if (this.isOver) {
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, SelectButtonColor, InputTextRadius);
        } else {
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, ButtonBorderColor, InputTextRadius);
        }

        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.textRect, ButtonColor, InputTextRadius - 1);

        UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos, this.label, 14, TextColorDefault);
        UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos, Icons.DOWN_ARROW, 14, TextColorBright);
        if (this.isOver) {
            UI_I.currentDrawBatch.fillBatch.addRoundedRectLeft(this.buttonRect, SelectButtonColor, InputTextRadius - 1);
        } else {
            UI_I.currentDrawBatch.fillBatch.addRoundedRectLeft(this.buttonRect, SelectorButtonColor, InputTextRadius - 1);
        }

    }
}
