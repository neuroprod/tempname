import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {
    ButtonBorderColor,
    ButtonColor, ButtonColorBright,

    InputTextRadius, SelectButtonColor,
    TextColorBright, TextColorDefault,

} from "./Style.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import Rect from "../lib/UI/math/Rect.ts";
import {ActionKey} from "../lib/UI/input/KeyboardListener.ts";
import Box from "../lib/UI/math/Box.ts";

export function addInputTextBox(id:string,ref:any,refValue:string,autoFocus=false,box =new Box()){
    if (!UI_I.setComponent(id)) {

        let s = new ComponentSettings()

        s.box =box;



        let comp = new InputText(UI_I.getID(id), s,ref,refValue,autoFocus);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as InputText;


    UI_I.popComponent()
    return r.getReturnValue();

}
export function addInputTextFill(id:string,ref:any,refValue:string,autoFocus=false){
    if (!UI_I.setComponent(id)) {

        let s = new ComponentSettings()

        s.box.size.set(-1,-1)



        let comp = new InputText(UI_I.getID(id), s,ref,refValue,autoFocus);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as InputText;


    UI_I.popComponent()
    return r.getReturnValue();

}
export function addInputText(id:string,ref:any,refValue:string,autoFocus=false,left:number=0,top:number =0,size:number=200){
    if (!UI_I.setComponent(id)) {

        let s = new ComponentSettings()

        s.box.size.set(size,33)
        s.box.marginLeft =left;
        s.box.marginTop =top;


        let comp = new InputText(UI_I.getID(id), s,ref,refValue,autoFocus);
        UI_I.addComponent(comp);
    }
    let r = UI_I.currentComponent as InputText;


    UI_I.popComponent()
    return r.getReturnValue();

}

export class InputText extends Component{
    private ref: any;
    private refValue: string;
    private text: any;

    private cursorPos: number = 0;


    private textPos =new Vec2()
    private textRect =new Rect();
    private cursorRect =new Rect(new Vec2,new Vec2(1,14))

    private _textIsDirty: boolean =false;
    private offsetArray:Array<number> =[];
    constructor(id:number, settings:ComponentSettings,ref:any,refValue:string,autoFocus:boolean) {
        super(id,settings);
        this.ref = ref;
        this.refValue =refValue;
        this.text = ref[refValue];
        this.cursorPos =this.text.length
        if(autoFocus) UI_I.setFocusComponent(this);
    }
    limitMouseCursor(pos: number) {
        if (pos < 0) pos = 0;
        if (pos > this.text.length) pos = this.text.length;
        return pos;
    }
    setKeys(buffer: string, actionKey: ActionKey) {



        if (actionKey == ActionKey.ArrowRight) {
            this.cursorPos = this.limitMouseCursor(this.cursorPos + 1);
            this.setDirty();
        }
        if (actionKey == ActionKey.ArrowLeft) {
            this.cursorPos = this.limitMouseCursor(this.cursorPos - 1);
            this.setDirty();
        }
        if (actionKey == ActionKey.BackSpace) {

                this.text = this.text.slice(0, this.cursorPos - 1) + this.text.slice(this.cursorPos);
                this.cursorPos = this.limitMouseCursor(this.cursorPos - 1);

                this.setTextDirty();
                this.setDirty();
            }





        if (buffer.length) {
            this.text = [
                this.text.slice(0, this.cursorPos),
                buffer,
                this.text.slice(this.cursorPos),
            ].join("");
            //(this.text = this.text);
            this.cursorPos = this.limitMouseCursor(this.cursorPos + buffer.length);
            this.setDirty();
            this.setTextDirty();

        }
    }
    onAdded() {
        super.onAdded();
        if( this.ref[ this.refValue] != this.text){
           this.text = this.ref[ this.refValue];
           this.setDirty()
        }
    }

    setTextDirty() {
        this.ref[ this.refValue] = this.text;

        this._textIsDirty = true;
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        this.textPos.x =this.layoutRect.pos.x+10;
        this.textPos.y = this.layoutRect.pos.y+this.layoutRect.size.y/2 -7;

        this.textRect.copy( this.layoutRect);
        this.textRect.size.x-=2;
        this.textRect.size.y-=2;
        this.textRect.pos.x+=1;
        this.textRect.pos.y+=1;

        this.cursorRect.pos.copy(this.textPos);
        if(this.text.length>1)
        this.cursorRect.pos.x +=UI_I.currentDrawBatch.sdfBatch.getCharPos(this.cursorPos,this.text,14)

    }


    prepDraw() {
        super.prepDraw();


        if(this.isFocus){
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect,ButtonColorBright,InputTextRadius);
            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.textRect,ButtonColor,InputTextRadius-1);
            UI_I.currentDrawBatch.fillBatch.addRect(this.cursorRect,TextColorBright)
            UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos,this.text,14,TextColorBright);
        }else{
            if (this.isOver) {
                UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, SelectButtonColor, InputTextRadius);
            } else {
                UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, ButtonBorderColor, InputTextRadius);
            }

            UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.textRect,ButtonColor,InputTextRadius-1);
            UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos,this.text,14,TextColorDefault);
        }


    }


}
