import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";


export function pushPanelMenuFill(label:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()



        let comp = new PanelMenu(UI_I.getID(label), s);
        UI_I.addComponent(comp);
    }


}
export function pushPanelMenu(label:string){



    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()

        s.box.size.set(300,34)
        s.box.setMargin(0)
        s.box.marginBottom=5
        s.box.marginLeft=10
        s.box.setPadding(0);

        let comp = new PanelMenu(UI_I.getID(label), s);
        UI_I.addComponent(comp);
    }


}
export function popPanelMenu(){

    UI_I.popComponent()
}


class PanelMenu extends Component{



    constructor(id:number,s:ComponentSettings) {

        super(id,s);

    }


    updateCursor(comp: Component) {
        this.placeCursor.x +=
            +comp.settings.box.marginLeft +
            comp.size.x +
            comp.settings.box.marginRight;
    }



}
