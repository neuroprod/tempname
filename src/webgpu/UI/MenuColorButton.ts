import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";


import {
    ButtonBorderColor,
    ButtonRadius, ColorButtonBorderColor,

} from "./Style.ts";
import Rect from "../lib/UI/math/Rect.ts";
import Color from "../lib/UI/math/Color.ts";
import {setSelectColorPopup} from "./SelectColorPopup.ts";



export function addMenuColorButtonPopup(id:string){



    if (!UI_I.setComponent(id)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);

        let col =new Color().setHex(id)

        let comp = new MenuColorButton(UI_I.getID(id), s,col);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MenuColorButton;


    UI_I.popComponent()
    return r.getReturnValue();
}

export function addMenuColorButton(id:string,color:Color){



    if (!UI_I.setComponent(id)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new MenuColorButton(UI_I.getID(id), s,color);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as MenuColorButton;
    if(r.getReturnValue()){
        setSelectColorPopup(r)
    }

    UI_I.popComponent()
    return r.getReturnValue();
}



export class MenuColorButton extends Component{


    public borderRect:Rect =new Rect();
    public colorRect:Rect =new Rect();
    public color :Color
    public borderColor =ButtonBorderColor
    constructor(id:number,s:ComponentSettings,color:Color) {

        super(id,s);


       this.color=color;
       if( this.color.r+this.color.g+this.color.b<0.5){
           this.borderColor =ColorButtonBorderColor;

       }
    }

    layoutRelative() {
        super.layoutRelative();

    }
    layoutAbsolute() {
        super.layoutAbsolute();



        this.borderRect.copy(this.layoutRect);
        this.borderRect.size.x-=8;
        this.borderRect.size.y-=8;
        this.borderRect.pos.x+=4;
        this.borderRect.pos.y+=4;

        this.colorRect.copy( this.borderRect);
        this.colorRect.size.x-=2;
        this.colorRect.size.y-=2;
        this.colorRect.pos.x+=1;
        this.colorRect.pos.y+=1;
    }

    prepDraw() {
        super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.borderRect, this.borderColor ,6+1)
        UI_I.currentDrawBatch.fillBatch.addRoundedRect( this.colorRect,this.color,6)




    }



    getReturnValue(): any {

        return this.isClicked;
    }
}
