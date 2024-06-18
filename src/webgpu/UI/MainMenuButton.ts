import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import Color from "../lib/UI/math/Color.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {SelectButtonColor, TextColorDefault, TextColorDisabled} from "./Style.ts";



export function addMainMenuButton(label:string,icon:string,selected:boolean){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(40,40)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new MainMenuButton(UI_I.getID(label), s,label,icon);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MainMenuButton;
    r.setSelected(selected);

    UI_I.popComponent()
    return r.getReturnValue();
}



class MainMenuButton extends Component{
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

        this.labelPos.copy(this.layoutRect.pos);



        this.iconPos.copy(this.layoutRect.pos);
        this.iconPos.y +=0
        this.iconPos.x +=3
    }

    prepDraw() {
        super.prepDraw();

        if(this.selected){
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,SelectButtonColor,8)
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,35,TextColorDefault)
        }else if(this.isOver){
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,35,TextColorDefault)

        }else{
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,35,TextColorDisabled)
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
