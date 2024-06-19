import {DockSplit} from "../lib/UI/docking/DockType.ts";
import Color from "../lib/UI/math/Color.ts";
import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import SplitNode from "./SplitNode.ts";
import Rect from "../lib/UI/math/Rect.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {MenuBGColor, SelectButtonColor} from "./Style.ts";





export function setSplitDivider(name: string, settings: SplitDividerSettings):SplitDivider {
    UI_I.currentComponent = UI_I.panelDockingDividingLayer;

    if (!UI_I.setComponent(name)) {

        let comp = new SplitDivider(UI_I.getID(name), settings);
        UI_I.addComponent(comp);
    }
    let divider = UI_I.currentComponent as SplitDivider;
    UI_I.popComponent();
    return divider;
}


export class SplitDividerSettings extends ComponentSettings {
    public splitType: DockSplit;


    public wideSize = 50;
    public smallSize = 6;

    constructor(type: DockSplit) {
        super();
        this.splitType = type;
    }
}

export  class SplitDivider extends Component {
    private isDragging: boolean = false;
    private startDragPos!: Vec2;

    private posMin: Vec2 = new Vec2();
    private posMax: Vec2 = new Vec2();
    private splitNode!: SplitNode;
    private center: Vec2 = new Vec2();

    private drawRect = new Rect();

    constructor(id: number, settings: SplitDividerSettings) {
        super(id, settings);

        if (settings.splitType == DockSplit.Horizontal) {
            this.size.set(settings.wideSize, settings.smallSize);
        } else {
            this.size.set(settings.smallSize, settings.wideSize);
        }
        settings.box.size.copy(this.size);
        this.posOffset.set(0, 0);
    }

    onMouseDown() {
        super.onMouseDown();
        this.isDragging = true;

        this.startDragPos = this.posOffset.clone();
    }

    updateOnMouseDown() {
        if (this.isDragging) {
            let dir = UI_I.mouseListener.mousePosDown.clone();
            dir.sub(UI_I.mouseListener.mousePos);
            let newPos = this.startDragPos.clone();

            newPos.sub(dir);

            newPos.clamp(this.posMin, this.posMax);

            this.splitNode.setDividerPos(newPos);

           // this.center.copy(newPos);

          //  this.setDirty(true);
        }
    }

    onMouseUp() {
        super.onMouseUp();
        this.isDragging = false;
        this.setDirty()
    }

    place(node: SplitNode, dividerPos: Vec2, min: Vec2, max: Vec2) {
        if (
            dividerPos.equal(this.center) &&
            min.equal(this.posMin) &&
            max.equal(this.posMax)
        )
            return;
        this.splitNode= node;
        this.center.copy(dividerPos);
        this.posMin.copy(min);
        this.posMax.copy(max);
        this.setDirty();
    }

    layoutRelative() {
        this.posOffset.copy(this.center);
        this.posOffset.sub(this.size.clone().scale(0.5));
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        this.drawRect.copy(this.layoutRect);
        this.drawRect.size.y-=2;
        this.drawRect.size.x-=2;
    }

    prepDrawInt() {
        let settings = this.settings as SplitDividerSettings;
        if (this.isOver || this.isDragging) {
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(
                this.drawRect,
                SelectButtonColor,1
            );
        } else {
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.drawRect,MenuBGColor,1);
        }
    }
}
