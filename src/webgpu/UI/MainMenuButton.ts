import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import Color from "../lib/UI/math/Color.ts";
import Rect from "../lib/UI/math/Rect.ts";



export function addMainMenuButton(label:string,icon:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()
        s.hasBackground =true;
        s.backgroundColor.setHex("#ffffff")
        s.box.size.set(100,-1)
        s.box.setMargin(0)
        s.box.marginLeft =2;
        s.box.marginRight =2;
        s.box.setPadding(0);



        let comp = new MainMenuButton(UI_I.getID(label), s,label,icon);
        UI_I.addComponent(comp);
    }
    UI_I.popComponent()

}



class MainMenuButton extends Component{
    private label: string;
    private icon: string;
    private labelPos:Vec2 =new Vec2()
    private iconPos:Vec2 =new Vec2()

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


        this.labelPos.y +=this.layoutRect.size.y/2 -6
        this.labelPos.x +=40

        this.iconPos.copy(this.layoutRect.pos);
        this.iconPos.y +=this.layoutRect.size.y/2 -10
        this.iconPos.x +=10
    }

    prepDraw() {
        super.prepDraw();
let rect =new Rect(new Vec2(100,100),new Vec2(400,400))

        UI_I.currentDrawBatch.fillBatch.addRoundedRect(rect,new Color(1,0,0.0),100)
        UI_I.currentDrawBatch.sdfBatch.addLine(this.labelPos,this.label,12,new Color(0.3,0.3,0.3),false)
        UI_I.currentDrawBatch.sdfBatch.addIcon(this.iconPos,this.icon,20,new Color(0.3,0.3,0.3))
    }


}
