import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";

import {ButtonRadius, SelectButtonColor, TextColorDefault, TextColorDisabled, TextColorSelect} from "./Style.ts";



export function addMainMenuToggleButton(label:string,icon:string,selected:boolean){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new MainMenuToggleButton(UI_I.getID(label), s,label,icon);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MainMenuToggleButton;
    r.setSelected(selected);

    UI_I.popComponent()
    return r.getReturnValue();
}



class MainMenuToggleButton extends Component{
    private label: string;
    private icon: string;
    private labelPos:Vec2 =new Vec2()
    private iconPos:Vec2 =new Vec2()
    public selected =false;

    constructor(id:number,s:ComponentSettings,label:string,icon:string) {

        super(id,s);

        this.label = label;
        this.icon =icon;
    }

    layoutRelative() {
        super.layoutRelative();

    }
    layoutAbsolute() {
        super.layoutAbsolute();

        this.iconPos.copy(this.layoutRect.size)
        this.iconPos.scale(0.5)
        this.iconPos.add(this.layoutRect.pos);
    }

    prepDraw() {
        super.prepDraw();

        if(this.selected){
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,SelectButtonColor,ButtonRadius)
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,20,TextColorSelect)
        }else if(this.isOver){
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,20,TextColorDefault)

        }else{
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,20,TextColorDisabled)
        }

       // UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,12,new Color(0.3,0.3,0.3),false)

    }


    setSelected(selected: boolean) {
        if(this.selected!=selected){
            this.selected =selected;
            this.setDirty();
        }
    }
    getReturnValue(): any {
        if(this.selected)return false;
        return this.isClicked;
    }
}
