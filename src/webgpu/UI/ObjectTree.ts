import {TreeReturn} from "../lib/UI/components/Tree.ts";
import UI_I from "../lib/UI/UI_I.ts";
import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import VerticalLayout, {VerticalLayoutSettings} from "../lib/UI/components/VerticalLayout.ts";

import Local from "../lib/UI/local/Local.ts";

import UI_IC from "../lib/UI/UI_IC.ts";

import {ButtonColor, OverButtonColor, TextColorDefault} from "./Style.ts";
import Rect from "../lib/UI/math/Rect.ts";
import Vec2 from "../lib/UI/math/Vec2.ts";
import {addSdfToggleIcon} from "./SDFToggleIcon.ts";
import {Icons} from "./Icons.ts";

export function pushObjectTree(label: string,isLeave:boolean,depth:number) {

    if (!UI_I.setComponent(label)) {
      let settings =new ComponentSettings()
        settings.box.size.x=-1;
        settings.box.size.y=-1;


        let comp = new ObjectTree(UI_I.getID(label), label, settings,depth);
        UI_I.addComponent(comp);
    }
    (UI_I.currentComponent.parent as ObjectTree).setLeave(isLeave);
    // @ts-ignore
    //let result = UI_I.currentComponent.parent.getReturnValue();


    //return result;
}

export function popObjectTree():void{
    UI_I.popComponent();
    UI_I.popComponent();
}

export default class ObjectTree extends Component {
    private container!: Component;

    private label: string;
    private verticalLSettings: VerticalLayoutSettings;
    private open: boolean = true;
    private isPressed = false;
    private isLeave: boolean =false;

    private backRect =new Rect()
    private textPos =new Vec2()

    private ret:TreeReturn={clicked:false,isOpen:this.open};
    private depth: number;
    constructor(id: number, label: string, settings: ComponentSettings,depth:number) {
        super(id, settings);
        this.drawChildren = true;

        this.label = label;
        this.depth  =depth;
        this.verticalLSettings = new VerticalLayoutSettings();
       this.verticalLSettings.needScrollBar = false;
        this.verticalLSettings.hasOwnDrawBatch = false;
        this.verticalLSettings.box.marginTop = 20;
        this.verticalLSettings.box.paddingTop = 0;
        this.verticalLSettings.box.paddingBottom = 0;



        this.setFromLocal();
    }

    setFromLocal() {
        let data = Local.getItem(this.id);
        if (data) {
            this.open = data.open;
            this.ret.isOpen =this.open
        }
    }

    saveToLocal() {
        let a = {
            open: this.open,
        };

        Local.setItem(this.id, a);
    }

    updateCursor(comp: Component) {
        if (comp instanceof ObjectTree || comp instanceof VerticalLayout) {
            this.placeCursor.y +=
                +comp.settings.box.marginTop +
                comp.size.y +
                comp.settings.box.marginBottom;
        } else {
            this.placeCursor.y = 0;
        }
    }
    layoutAbsolute() {
        super.layoutAbsolute();
        this.backRect.copy(this.layoutRect)
        this.backRect.size.y=20;
        this.textPos.copy(this.layoutRect.pos)
        this.textPos.x+=this.depth*10+17
        this.textPos.y+=4
    }

    prepDraw() {
    super.prepDraw();
        UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos,this.label,12,TextColorDefault)

        if(this.isOver){
            UI_I.currentDrawBatch.fillBatch.addRect(this.backRect,OverButtonColor)
        }
        else if( this.isOverChild || this.label=="root"){
         UI_I.currentDrawBatch.fillBatch.addRect(this.backRect,ButtonColor)
        }
}

    needsResize(): boolean {
        if (this.size.y < this.placeCursor.y) {
            this.size.y = this.placeCursor.y;
        }
        if (this.size.y > this.placeCursor.y) {
            this.size.y = this.placeCursor.y;
        }

        return false;
    }

    setSubComponents() {
        super.setSubComponents();


        if (!this.isLeave) {

         if (addSdfToggleIcon(
                "ib",
                this,
                "open",
                Icons.NEXT,
                Icons.DOWN_ARROW,
             this.depth*10,2,16
            )) {
                this.ret.isOpen =this.open
                this.saveToLocal();
                this.setDirty(true);

            }
        }


        UI_IC.pushVerticalLayout("l"+this.id, this.verticalLSettings);
        this.container = UI_I.currentComponent;

        this.container.drawChildren = this.open;
    }

    getReturnValue(): any {
        if (this.isPressed) {
            this.isPressed = false
            this.ret.clicked =true
        }else{
            this.ret.clicked =false
        }
        return this.ret;
    }

    setLeave(isLeave: boolean) {
        if(this.isLeave !=isLeave){
            this.isLeave =isLeave

            this.setDirty();
        }



    }
}
