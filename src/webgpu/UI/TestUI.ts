import Component from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import Color from "../lib/UI/math/Color.ts";

export default class TestUI extends Component{



    prepDraw() {
        super.prepDraw();
//test
        UI_I.currentDrawBatch.textBatch.addLine(new Vec2(10,10),"hello",100,new Color(1,1,1))
       UI_I.currentDrawBatch.sdfBatch.addLine(new Vec2(10,30),"Hello is this ok?",100,new Color(1,1,1))
    }


}
