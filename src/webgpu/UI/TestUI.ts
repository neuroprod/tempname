import Component from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import Color from "../lib/UI/math/Color.ts";

export default class TestUI extends Component{



    prepDraw() {
        super.prepDraw();
//test
        let text ='Aa!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
      UI_I.currentDrawBatch.textBatch.addLine(new Vec2(0,0),text,200,new Color(1,1,1))
      UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(0,100-16),text,16,new Color(0,0,0))
        UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(0,200),text,16,new Color(0,0,0),true)
        UI_I.currentDrawBatch.sdfBatch.addIcon(new Vec2(0,100-16),"a",16,new Color(0,0,0))
        UI_I.currentDrawBatch.sdfBatch.addIcon(new Vec2(50,100-16),"b",16,new Color(0,0,0))
        UI_I.currentDrawBatch.sdfBatch.addIcon(new Vec2(100,100-16),"c",16,new Color(0,0,0))
        UI_I.currentDrawBatch.sdfBatch.addIcon(new Vec2(150,100-16),"d",16,new Color(0,0,0))
    }


}
