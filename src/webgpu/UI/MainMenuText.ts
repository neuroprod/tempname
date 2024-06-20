import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import {TextColorDefault, TextColorDisabled} from "./Style.ts";



export function addMainMenuText(label:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(33,33)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =8;
        s.box.setPadding(0);



        let comp = new MainMenuText(UI_I.getID(label), s,label);
        UI_I.addComponent(comp);
    }



    UI_I.popComponent()

}



class MainMenuText extends Component{

    private label: string;
    private labelPos:Vec2 =new Vec2()
    private fontSize =12;

    constructor(id:number,s:ComponentSettings,label:string) {

        super(id,s);
        this.label =label


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

            UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,this.fontSize,TextColorDefault)


        // UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,12,new Color(0.3,0.3,0.3),false)

    }



}
