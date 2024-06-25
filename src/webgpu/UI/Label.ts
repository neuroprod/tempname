import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import {TextColorBright, TextColorDefault} from "./Style.ts";
import Color from "../lib/UI/math/Color.ts";

export function addTitle(label:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(-1,20)
        s.box.setMargin(0)
        s.box.marginLeft =8;
        s.box.marginTop =10;
        s.box.marginBottom =13;

        s.box.setPadding(0);



        let comp = new Label(UI_I.getID(label), s,label,14,TextColorBright);
        UI_I.addComponent(comp);
    }



    UI_I.popComponent()

}

export function addMainMenuText(label:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =8;
        s.box.setPadding(0);



        let comp = new Label(UI_I.getID(label), s,label,12,TextColorDefault);
        UI_I.addComponent(comp);
    }



    UI_I.popComponent()

}



class Label extends Component{

    private label: string;
    private labelPos:Vec2 =new Vec2()
    private fontSize =12;
    private fontColor: Color;

    constructor(id:number,s:ComponentSettings,label:string,fontSize:number,fontColor:Color) {

        super(id,s);
        this.label =label
        this.fontSize =fontSize
        this.fontColor = fontColor;

    }

    layoutRelative() {
        super.layoutRelative();
        this.size.x =    UI_I.currentDrawBatch.sdfBatch.getLineSize(this.label,this.fontSize);
    }
    layoutAbsolute() {
        super.layoutAbsolute();





        this.labelPos.copy(this.layoutRect.pos)
        this.labelPos.y+=this.layoutRect.size.y/2 -(this.fontSize/2);
    }

    prepDraw() {
        super.prepDraw();

            UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,this.fontSize,this.fontColor)


        // UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,12,new Color(0.3,0.3,0.3),false)

    }



}
