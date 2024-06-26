import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";

import {
    ButtonBorderColor,
    ButtonColor,
    ButtonRadius, DownButtonColor, OverButtonColor, TextColorBright,

    TextColorDefault,
    TextColorDisabled,

} from "./Style.ts";
import Rect from "../lib/UI/math/Rect.ts";


export function addTextButton(label:string,enabled:boolean=true){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(-1,33)
        s.box.setMargin(0)

        s.box.setPadding(0);



        let comp = new MainMenuTextButton(UI_I.getID(label), s,label,false);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MainMenuTextButton;
    r.setEnabled(enabled);

    UI_I.popComponent()
    return r.getReturnValue();
}

export function addMainMenuTextButton(label:string,enabled:boolean=true){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new MainMenuTextButton(UI_I.getID(label), s,label);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MainMenuTextButton;
    r.setEnabled(enabled);

    UI_I.popComponent()
    return r.getReturnValue();
}



class MainMenuTextButton extends Component{

    private label: string;

    private labelPos:Vec2 =new Vec2()
    public enabled =false;
    public borderRect:Rect =new Rect();
    private fontSize =14;
    private autoSize: boolean;
    constructor(id:number,s:ComponentSettings,label:string,autoSize =true) {

        super(id,s);

        this.autoSize =autoSize;
        this.label =label;
    }

    layoutRelative() {
        super.layoutRelative();
        if(this.autoSize)
        this.size.x =    UI_I.currentDrawBatch.sdfBatch.getLineSize(this.label,this.fontSize)+26;
    }
    layoutAbsolute() {
        super.layoutAbsolute();

        this.labelPos.copy(this.layoutRect.pos)
        this.labelPos.y+=this.layoutRect.size.y/2 -(this.fontSize/2);
        this.labelPos.x+=this.layoutRect.size.x/2 -UI_I.currentDrawBatch.sdfBatch.getLineSize(this.label,this.fontSize)/2;
        this.borderRect.copy(this.layoutRect);
        this.borderRect.size.x-=2;
        this.borderRect.size.y-=2;
        this.borderRect.pos.x+=1;
        this.borderRect.pos.y+=1;
    }

    prepDraw() {
        super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,ButtonBorderColor,ButtonRadius+1)

        if(this.isDown){
            UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,this.fontSize,TextColorBright)
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect,DownButtonColor,ButtonRadius)

        }
        else if(this.isOver){
            UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,this.fontSize,TextColorBright)
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect,OverButtonColor,ButtonRadius)

        }else{
            UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,this.fontSize,TextColorDefault)
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect,ButtonColor,ButtonRadius)
        }

        // UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,12,new Color(0.3,0.3,0.3),false)

    }


    setEnabled(enabled: boolean) {
        if(this.enabled!=enabled){
            this.enabled =enabled;
            this.setDirty();
        }
    }
    getReturnValue(): any {
        if(!this.enabled)return false;
        return this.isClicked;
    }
}
