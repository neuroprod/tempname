import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";

import {
    ButtonBorderColor,
    ButtonColor, ButtonColorBright, ButtonIconSize,
    ButtonRadius, DownButtonColor, DownButtonColorBright, OverButtonColor, OverButtonColorBright, TextColorBright,

    TextColorDefault,
    TextColorDisabled,

} from "./Style.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {Icons} from "./Icons.ts";
import Color from "../lib/UI/math/Color.ts";


export function addPlayButton(label:string,enabled:boolean=true){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)

        s.box.setPadding(0);



        let comp = new PlayPauzeRecButton(UI_I.getID(label), s);
        comp.iconSelect =Icons.PAUZE;
        comp.iconNonSelect =Icons.PLAY;
        comp.icon = comp.iconNonSelect;


        comp.textColorSelect =TextColorDefault;
        comp.textColorNonSelect =TextColorDefault;
        comp.textColor = comp.textColorNonSelect;


        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as PlayPauzeRecButton;
    r.setEnabled(enabled);

    UI_I.popComponent()
    return r.getReturnValue();
}
export function addRecButton(label:string,enabled:boolean=true){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new PlayPauzeRecButton(UI_I.getID(label), s);
        console.log(comp)
        comp.iconSelect =Icons.RECORD;
        comp.iconNonSelect =Icons.RECORD;
        comp.icon = comp.iconNonSelect;


        comp.textColorSelect =new Color(0.8,0,0);
        comp.textColorNonSelect =TextColorDefault;
        comp.textColor = comp.textColorNonSelect;

        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as PlayPauzeRecButton;
    r.setEnabled(enabled);

    UI_I.popComponent()
    return r.getReturnValue();
}



class PlayPauzeRecButton extends Component{

    public  iconSelect!: string;
    public  iconNonSelect!: string;
    public icon!:string;

    public  textColorSelect!:Color;
    public  textColorNonSelect!:Color;
    public textColor!:Color;

    private iconPos:Vec2 =new Vec2()
    public enabled =false;
    public borderRect:Rect =new Rect();

    constructor(id:number,s:ComponentSettings) {

        super(id,s);



    }

    layoutRelative() {
        super.layoutRelative();

    }
    layoutAbsolute() {
        super.layoutAbsolute();

        this.iconPos.copy(this.layoutRect.size);
        this.iconPos.scale(0.5);
        this.iconPos.add(this.layoutRect.pos);

        this.borderRect.copy(this.layoutRect);
        this.borderRect.size.x-=2;
        this.borderRect.size.y-=2;
        this.borderRect.pos.x+=1;
        this.borderRect.pos.y+=1;
    }

    prepDraw() {
        super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,ButtonBorderColor,ButtonRadius+1)



            if (this.isDown) {
                UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos, this.icon, ButtonIconSize, this.textColor)
                UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect, DownButtonColor, ButtonRadius)

            } else if (this.isOver) {
                UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos, this.icon, ButtonIconSize, this.textColor)
                UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect, OverButtonColor, ButtonRadius)

            } else {
                UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos, this.icon, ButtonIconSize, this.textColor)
                UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect, ButtonColor, ButtonRadius)
            }



    }


    setEnabled(enabled: boolean) {

        if(this.enabled!=enabled){
            this.enabled =enabled;

            if(this.enabled){
                this.icon =this.iconSelect
                this.textColor=this.textColorSelect;
            }else{
                this.icon =this.iconNonSelect
                this.textColor=this.textColorNonSelect;
            }

            this.setDirty();
        }
    }
    getReturnValue(): any {

        return this.isClicked;
    }
}
