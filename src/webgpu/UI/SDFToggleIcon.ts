


import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import {TextColorBright, TextColorDefault} from "./Style.ts";
import UI_I from "../lib/UI/UI_I.ts";
import ToggleIcon, {ToggleIconSettings} from "../lib/UI/components/internal/ToggleIcon.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";

export function addSdfToggleIcon(
    name: string,
    ref: any,
    prop: string,
    iconTrue: string,
    iconFalse: string,x:number,y:number,size:number
): boolean {
    if (!UI_I.setComponent(name)) {

        let settings =new ComponentSettings()
        settings.box.size.set(size,size)
        settings.box.marginLeft =x;
        settings.box.marginTop=y;
        let comp = new SDFToggleIcon(
            UI_I.getID(name),
            settings,
            ref,
            prop,
            iconTrue,
            iconFalse,

        );
        UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
}

export default class SDFToggleIcon extends Component {
    private ref: any;
    private property: string;

    private changed: boolean = false;
    private iconTrue: string;
    private iconFalse: string;
private iconPos:Vec2 =new Vec2()
    constructor(
        id: number,
        settings: ComponentSettings,
        ref: any,
        property: string,
        iconTrue: string,
        iconFalse: string


    ) {
        super(id, settings);

       // this.size.copy(settings.box.size);
        this.iconTrue = iconTrue;
        this.iconFalse = iconFalse;
        this.ref = ref;
        this.property = property;
    }

    onMouseClicked() {
        super.onMouseClicked();

        this.ref[this.property] = !this.ref[this.property];
        this.changed = true;
        this.setDirty();
    }
    layoutAbsolute() {
        super.layoutAbsolute()
        this.iconPos.copy(this.layoutRect.pos)
        this.iconPos.x+=this.layoutRect.size.x/2;
        this.iconPos.y+=this.layoutRect.size.y/2;
    }

    prepDraw() {
      //  let settings = this.settings as ToggleIconSettings;
        let color = TextColorDefault;
        if (this.isOver) {
            color = TextColorBright;
        }
        let icon = this.ref[this.property] ? this.iconTrue : this.iconFalse;

        UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,icon,this.settings.box.size.x,color)
    }

    getReturnValue(): boolean {
        let change = this.changed;
        this.changed = false;
        return change;
    }
}
