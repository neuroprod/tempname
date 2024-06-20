import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";

import {
    ButtonBorderColor,
    ButtonColor, ButtonIconSize,
    ButtonRadius, DownButtonColor, OverButtonColor, TextColorBright,

    TextColorDefault,
    TextColorDisabled,

} from "./Style.ts";
import Rect from "../lib/UI/math/Rect.ts";



export function addMainMenuButton(label:string,icon:string,enabled:boolean=true){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new MainMenuButton(UI_I.getID(label), s,icon);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MainMenuButton;
    r.setEnabled(enabled);

    UI_I.popComponent()
    return r.getReturnValue();
}



class MainMenuButton extends Component{

    private icon: string;

    private iconPos:Vec2 =new Vec2()
    public enabled =false;
    public borderRect:Rect =new Rect();
    constructor(id:number,s:ComponentSettings,icon:string) {

        super(id,s);


        this.icon =icon;
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

        if(this.isDown ){
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,ButtonIconSize,TextColorBright)
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect,DownButtonColor,ButtonRadius)

        }
       else if(this.isOver){
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,ButtonIconSize,TextColorBright)
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect,OverButtonColor,ButtonRadius)

        }else{
            UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,ButtonIconSize,TextColorDefault)
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
