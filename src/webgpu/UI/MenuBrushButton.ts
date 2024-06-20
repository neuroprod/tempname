import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";


import {
    ButtonBorderColor,
    ButtonRadius, TextColorDefault,

} from "./Style.ts";
import Rect from "../lib/UI/math/Rect.ts";
import Color from "../lib/UI/math/Color.ts";



export function addMenuBrushButton(size:number){


let l ="brush"+size
    if (!UI_I.setComponent(l)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new MenuBrushButton(UI_I.getID(l), s,size);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MenuBrushButton;


    UI_I.popComponent()
    return r.getReturnValue();
}



class MenuBrushButton extends Component{



    public colorRect:Rect =new Rect();
    private radius: number;

    constructor(id:number,s:ComponentSettings,size:number) {

        super(id,s);
        this.radius = size;


    }

    layoutRelative() {
        super.layoutRelative();

    }
    layoutAbsolute() {
        super.layoutAbsolute();






        this.colorRect.pos.copy(this.layoutRect.pos);
        this.colorRect.pos.x+=this.layoutRect.size.x/2 -this.radius;
        this.colorRect.pos.y+=this.layoutRect.size.y/2-this.radius;
        this.colorRect.size.x=this.radius*2;
        this.colorRect.size.y=this.radius*2;

    }

    prepDraw() {
        super.prepDraw();
       // UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect,ButtonBorderColor,6+1)
        UI_I.currentDrawBatch.fillBatch.addRoundedRect( this.colorRect,TextColorDefault,this.radius)




    }



    getReturnValue(): any {

        return this.isClicked;
    }
}
