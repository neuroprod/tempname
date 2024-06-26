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


export function addSelector(label: string) {

    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        let comp = new Selector(UI_I.getID(label), s, label);

        UI_I.addComponent(comp);
    }


    UI_I.popComponent()
}

export class Selector extends Component {
    private label: string;
    private textPos = new Vec2()
    private iconPos = new Vec2()
    private textRect = new Rect();
    private buttonRect = new Rect();

    constructor(id: number, settings: ComponentSettings, label: string) {
        super(id, settings);
        this.label = label;
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
