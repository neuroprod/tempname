import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import UI_I from "../lib/UI/UI_I.ts";
import { DownButtonColorBright, OverButtonColor, TextColorBright, TextColorDefault} from "./Style.ts";


export function addSelectorListButton(label:string){
    if (!UI_I.setComponent(label)) {
        let settings =new ComponentSettings()
        settings.box.size.set(-1,33)


        let comp = new ListButton(
            UI_I.getID(label), settings,
            label,10,false

        );
        UI_I.addComponent(comp);
    }

    let result = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return result;
}
export function addListButton(label:string){
    if (!UI_I.setComponent(label)) {
        let settings =new ComponentSettings()
        settings.box.size.set(-1,24)


        let comp = new ListButton(
            UI_I.getID(label), settings,
            label,

        );
        UI_I.addComponent(comp);
    }

    let result = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return result;
}


export  class ListButton extends Component {
    private label: string;
    private textPos!: Vec2;

    private ro =-1;
    private needBack: boolean =false;
    private textOffset: number=25;
    private needBackSwitch: boolean;

    constructor(id: number,  settings: ComponentSettings,label: string,textOffset=25,needBackSwitch=true) {
        super(id, settings);

        this.size.copy(settings.box.size);
        this.label = label;
        this.textOffset = textOffset;
        this.needBackSwitch = needBackSwitch;
    }
    onAdded() {
        super.onAdded();
        if(!this.needBackSwitch)return;
        if (this.ro == this.renderOrder) return;
        this.ro = this.renderOrder;
        if (this.renderOrder % 2 == 0) {
            this.needBack =true
        } else {
            this.needBack =false
        }
        this.setDirty();
    }
    layoutAbsolute() {
        super.layoutAbsolute();

        this.textPos = this.layoutRect.pos.clone();
        this.textPos.copy(this.layoutRect.pos);
        this.textPos.x+=this.textOffset;
        this.textPos.y+=this.layoutRect.size.y/2-7
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();
        if (this.isOver) {

            UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, DownButtonColorBright);
            UI_I.currentDrawBatch.sdfBatch.addLine(     this.textPos,this.label,14,TextColorBright)
        }else{
            if(this.needBack)UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, OverButtonColor);
            UI_I.currentDrawBatch.sdfBatch.addLine(     this.textPos,this.label,14,TextColorDefault)
        }


/*
        let settings = this.settings as ButtonBaseSettings;
        let labelColor =  settings.labelColor;
        if (!this.enabled) {
            labelColor =  settings.labelColorDisabled;
        }
        UI_I.currentDrawBatch.textBatch.addLine(
            this.textPos,
            this.label,
            this.textMaxSize,
            labelColor
        );

        if (settings.transparent) return;

        let color;
        if (this.enabled) {
            if (this.isDown) {
                color = settings.downColor;
            } else if (this.isOver) {
                color = settings.overColor;
            } else {
                color = settings.backColor;
            }
        } else {
            color = settings.disableColor;
        }
        UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, color);*/
    }

    getReturnValue() {

        return this.isClicked;
    }


}
