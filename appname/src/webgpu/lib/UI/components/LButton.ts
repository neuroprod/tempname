import LComponent, {LComponentSettings} from "./LComponent";
import UI_IC from "../UI_IC";

export class LButtonSettings extends LComponentSettings {
}

export default class LButton extends LComponent {
    private buttonText: string;
    private enabled =true;
    constructor(
        id: number,
        label: string,
        buttonText: string,
        settings: LButtonSettings
    ) {
        super(id, label, settings);
        this.buttonText = buttonText;
    }
    setEnabled(enabled:boolean){
        if (this.enabled != enabled){
            this.enabled =enabled
            this.setDirty();
        }

    }
    setSubComponents() {
        super.setSubComponents();
        this.isDown = UI_IC.buttonBase(this.buttonText,this.enabled);
    }

    getReturnValue(): boolean {
        return this.isDown;
    }
}
