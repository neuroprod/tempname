import {TreeReturn} from "../../lib/UI/components/Tree.ts";
import UI_I from "../../lib/UI/UI_I.ts";
import Component, {ComponentSettings} from "../../lib/UI/components/Component.ts";
import VerticalLayout, {VerticalLayoutSettings} from "../../lib/UI/components/VerticalLayout.ts";

import Local from "../../lib/UI/local/Local.ts";

import UI_IC from "../../lib/UI/UI_IC.ts";

import {ButtonColor, OverButtonColor, SelectButtonColor, TextColorBright, TextColorDefault} from "../../UI/Style.ts";
import Rect from "../../lib/UI/math/Rect.ts";
import Vec2 from "../../lib/UI/math/Vec2.ts";
import {addSdfToggleIcon} from "../../UI/SDFToggleIcon.ts";
import {Icons} from "../../UI/Icons.ts";
import UIKeyFrameData, {UIKeyFrames} from "./UIKeyFrameData.ts";

export function pushAnimationTree(label: string, isLeave: boolean, depth: number, selected:boolean, keyDataMain: UIKeyFrameData):any {

    if (!UI_I.setComponent(label)) {
        let settings = new ComponentSettings()
        settings.box.size.x = -1;
        settings.box.size.y = -1;


        let comp = new AnimationTree(UI_I.getID(label), label, settings, depth,keyDataMain);
        UI_I.addComponent(comp);
    }
    (UI_I.currentComponent.parent as AnimationTree).setLeave(isLeave);
    (UI_I.currentComponent.parent as AnimationTree).setSelected(selected);

    return (UI_I.currentComponent.parent as AnimationTree).getReturnValue();
}

export function popAnimationTree(): void {
    UI_I.popComponent();
    UI_I.popComponent();
}

export default class AnimationTree extends Component {
    private container!: Component;

    private label: string;
    private verticalLSettings: VerticalLayoutSettings;
    private open: boolean = true;

    private isLeave: boolean = false;

    private backRect = new Rect()
    private textPos = new Vec2()

    private ret: TreeReturn = {clicked: false, isOpen: this.open};
    private depth: number;
    private selected: boolean = false;
    private keyFrameOffset: number;
    private keyDataMain: UIKeyFrameData;

    constructor(id: number, label: string, settings: ComponentSettings, depth: number, keyDataMain: UIKeyFrameData) {
        super(id, settings);
        this.drawChildren = true;
        this.keyFrameOffset=250;
        this.label = label;
        this.depth = depth;
        this.verticalLSettings = new VerticalLayoutSettings();
        this.verticalLSettings.needScrollBar = false;
        this.verticalLSettings.hasOwnDrawBatch = false;
        this.verticalLSettings.box.marginTop = 20;
        this.verticalLSettings.box.paddingTop = 0;
        this.verticalLSettings.box.paddingBottom = 0;
        this.keyDataMain = keyDataMain;

        this.setFromLocal();
    }

    setFromLocal() {
        let data = Local.getItem(this.id);
        if (data) {
            this.open = data.open;
            this.ret.isOpen = this.open
        }
    }

    saveToLocal() {
        let a = {
            open: this.open,
        };

        Local.setItem(this.id, a);
    }

    updateCursor(comp: Component) {
        if (comp instanceof Animation|| comp instanceof VerticalLayout) {
            this.placeCursor.y +=
                +comp.settings.box.marginTop +
                comp.size.y +
                comp.settings.box.marginBottom;
        } else {
            this.placeCursor.y = 0;
        }
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        this.backRect.copy(this.layoutRect)
        this.backRect.size.y = 20;
        this.backRect.size.x =this.keyFrameOffset-10;
        this.textPos.copy(this.layoutRect.pos)
        this.textPos.x += this.depth * 10 + 17
        this.textPos.y += 4
    }

    prepDraw() {
        super.prepDraw();

        if (this.selected) {

            UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos, this.label, 12, TextColorBright)
            UI_I.currentDrawBatch.fillBatch.addRect(this.backRect, SelectButtonColor)
        } else if (this.isOver) {
            UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos, this.label, 12, TextColorDefault)
            UI_I.currentDrawBatch.fillBatch.addRect(this.backRect, OverButtonColor)
        } else if (this.isOverChild || this.depth==0) {
            UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos, this.label, 12, TextColorDefault)
            UI_I.currentDrawBatch.fillBatch.addRect(this.backRect, ButtonColor)
        }else{
            UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos, this.label, 12, TextColorDefault)
        }

    }

    needsResize(): boolean {
        if (this.size.y < this.placeCursor.y) {
            this.size.y = this.placeCursor.y;
        }
        if (this.size.y > this.placeCursor.y) {
            this.size.y = this.placeCursor.y;
        }

        return false;
    }

    setSubComponents() {
        super.setSubComponents();


        if (!this.isLeave) {
            if (addSdfToggleIcon(
                "ib",
                this,
                "open",
                Icons.DOWN_ARROW,
                Icons.NEXT,

                this.depth * 10, 2, 16
            )) {
                this.ret.isOpen = this.open
                this.saveToLocal();
                this.setDirty(true);
            }
            UIKeyFrames(this.label+"k",this.keyDataMain,this.keyFrameOffset)
        }


        UI_IC.pushVerticalLayout("l" + this.id, this.verticalLSettings);
        this.container = UI_I.currentComponent;

        this.container.drawChildren = this.open;
    }

    getReturnValue(): any {
        return {isClicked:this.isClicked,open:this.open};

    }

    setLeave(isLeave: boolean) {
        if (this.isLeave != isLeave) {
            this.isLeave = isLeave

            this.setDirty();
        }


    }

    setSelected(selected: boolean) {
        if (this.selected != selected) {
            this.selected = selected

            this.setDirty();
        }
    }
}
