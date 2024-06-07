import Component, {ComponentSettings} from "../../lib/UI/components/Component.ts";

import AnimationEditor from "./AnimationEditor.ts";

import UI_I from "../../lib/UI/UI_I.ts";
import Color from "../../lib/UI/math/Color.ts";
import Rect from "../../lib/UI/math/Rect.ts";

import Vec2 from "../../lib/UI/math/Vec2.ts";

import Font from "../../lib/UI/draw/Font.ts";

export class UIAnimationEditorSettings extends ComponentSettings
{
    constructor() {
        super();
        this.box.size.set(-1,-1)
    }

}
export default class UIAnimationEditor extends Component{


//settings
    private frameSize =10;
    private keyFramesOffset =new Vec2(100,20)

//values
    private mousePos =new Vec2()
    private topLeft =new Vec2()

    private keysBackgroundRect =new Rect()
    private keysBackgroundColor =new Color().setHex("#444444",1)
    private keysLineRect =new Rect()
    private keysLineColor =new Color().setHex("#5e5e5e",1)
    //cursor
    private cursorDrag:boolean =false;
    private cursorPos =new Vec2()
    private cursorRect =new Rect(new Vec2(0,-21),new Vec2(20,16))
    private cursorLineRect =new Rect()
    private cursorColor =new Color().setHex("#ff156c",1)
    private cursorText: string="";
    private cursorTextColor: Color =new Color().setHex("#FFFFFF",1)
    private cursorTextPos =new Vec2()

    //temps

    private mouseStartDragX: number=0;
    private cursorDragStartFrame: number =0;


    constructor(id: number, settings: UIAnimationEditorSettings) {
                super(id,settings)




    }
    onMouseDown() {
        super.onMouseDown();

        if(this.cursorRect.contains(UI_I.mouseListener.mousePos)){

            this.mouseStartDragX =UI_I.mouseListener.mousePos.x
            this.cursorDrag =true;
            this.cursorDragStartFrame = AnimationEditor.currentFrame;
            console.log("hit")

        }

       // this.mousePos.copy(UI_I.mouseListener.mousePos)
       // this.mousePos.add(this.layoutRect.pos)
        //this.mousePos.add(this.keyFramesOffset)

    }
    onMouseUp() {
        super.onMouseUp();



        this.cursorDrag =false;
        //this.mousePos.copy(UI_I.mouseListener.mousePos)
        //this.mousePos.add(this.layoutRect.pos)
        //this.mousePos.add(this.keyFramesOffset)

    }
    updateOnMouseDown() {
        super.updateOnMouseDown();

        if(this.cursorDrag){
            let mouseOffset = UI_I.mouseListener.mousePos.x -this.mouseStartDragX;
            let frameOffset =Math.round(mouseOffset/this.frameSize)
            AnimationEditor.currentFrame =this.cursorDragStartFrame+frameOffset;
        }
       // this.mousePos.copy(UI_I.mouseListener.mousePos)
        //this.mousePos.add(this.layoutRect.pos)
        //this.mousePos.add(this.keyFramesOffset)

    }


    onAdded() {

        super.onAdded();
        if(AnimationEditor.isDrawDirty)
        {
            this.setDirty()
            AnimationEditor.isDrawDirty =false;
        }
    }
    //set the correct size
    layoutRelative() {
        //extend
    }
    //layout rect is set
    layoutAbsolute() {
        this.topLeft.copy(this.layoutRect.pos)
        this.topLeft.add(this.keyFramesOffset);

        //background
        this.keysBackgroundRect.pos.copy(this.topLeft)
        this.keysBackgroundRect.size.copy(this.layoutRect.size)
        this.keysBackgroundRect.size.sub(this.keyFramesOffset)
        this.keysLineRect.pos.copy(this.topLeft)
        this.keysLineRect.size.set(1, this.keysBackgroundRect.size.y)


        //cursor
        this.cursorPos.copy(this.topLeft)
        this.cursorPos.x +=AnimationEditor.currentFrame*this.frameSize;
        this.cursorPos.y -=2
        this.cursorLineRect.size.copy(this.keysLineRect.size);
        this.cursorLineRect.pos.copy(this.cursorPos)

        this.cursorRect.pos.copy( this.cursorLineRect.pos)
        this.cursorRect.pos.x-=this.cursorRect.size.x/2;
        this.cursorRect.pos.y-=16;
        this.cursorRect.setMinMax();

        this.cursorText = AnimationEditor.currentFrame+"";
        let size =Font.getTextSize(  this.cursorText);
        this.cursorTextPos.copy(this.cursorRect.pos)
        this.cursorTextPos.x+=this.cursorRect.size.x/2 -size.x/2
        this.cursorTextPos.y+=this.cursorRect.size.y/2 -size.y/2-1
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0 || this.layoutRect.size.y < 0) return;
        super.prepDraw();


//background
        UI_I.currentDrawBatch.fillBatch.addRect(this.keysBackgroundRect, this.keysBackgroundColor);

//backgroundLines
        for(let i=1;i<=AnimationEditor.numFrames;i++){
            UI_I.currentDrawBatch.fillBatch.addRect(this.keysLineRect, this.keysLineColor);
            this.keysLineRect.pos.x+=this.frameSize;
        }
        //cursor
        UI_I.currentDrawBatch.fillBatch.addRect(this.cursorLineRect, this.cursorColor);
        UI_I.currentDrawBatch.fillBatch.addRect(this.cursorRect, this.cursorColor);
        UI_I.currentDrawBatch.textBatch.addLine(this.cursorTextPos,this.cursorText,1000,this.cursorTextColor)
        /*let p =new Vec2(40,40);
        p.add(this.layoutRect.pos);
        UI_I.currentDrawBatch.fillBatch.addKeyframe(p, new Color(1,1,1));*/

    }
    setSubComponents() {
        super.setSubComponents();
      //  UI_IC.buttonBase("test",true,this.testSettings);

        // UI_IC.buttonBase("test2",true,this.testSettings2);
    }


}
