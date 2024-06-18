import Component from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import Color from "../lib/UI/math/Color.ts";

export default class TestUI extends Component{



    prepDraw() {
        super.prepDraw();
//test
      UI_I.currentDrawBatch.textBatch.addLine(new Vec2(10,10),"is this ok?",200,new Color(1,1,1))
      //UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(30,500),"is this ok?",8,new Color(1,1,1))
       /* UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(10,40),"is this ok?",12,new Color(1,1,1))
        UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(10,50),"Hello is this ok?",40,new Color(1,1,1))



        UI_I.currentDrawBatch.textBatch.addLine(new Vec2(200,10),"i s this ok?",200,new Color(0,0,0))
        UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(200,30),"Hello is this ok?",8,new Color(0,0,0))
        UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(200,100),"Hello is this ok pil?",48,new Color(0,0,0))
        UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(200,50),"Hello is this ok?",40,new Color(0,0,0))*/
    }


}
