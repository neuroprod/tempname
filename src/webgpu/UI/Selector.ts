import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";
import UI_I from "../lib/UI/UI_I.ts";


export function addSelector(label:string){

    if (!UI_I.setComponent(label)) {

        let s = new ComponentSettings()
        s.hasBackground =true;
        let comp = new Selector(UI_I.getID(label),s,label);

        UI_I.addComponent(comp);
    }



    UI_I.popComponent()
}

export class Selector extends Component{

    constructor(id:number,settings:ComponentSettings,label:string) {
        super(id,settings);
    }
}
