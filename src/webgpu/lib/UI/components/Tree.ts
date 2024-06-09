import UI_I from "../UI_I";
import Component, {ComponentSettings} from "./Component";
import VerticalLayout, {VerticalLayoutSettings} from "./VerticalLayout";

import UI_IC from "../UI_IC";
import Local from "../local/Local";
import Group from "./Group.ts";

export class TreeSettings extends ComponentSettings {
    public iconOpen = 1;
    public iconClose = 2;

    constructor() {
        super();
        this.box.marginTop = 0;
        this.box.marginBottom = 0;
        this.box.marginLeft = UI_I.globalStyle.compIndent;
        this.box.paddingLeft = 10 * Math.min(UI_I.groupDepth, 1);
        this.box.size.y = 16;

    }
}

export default class Tree extends Component {
    private container!: Component;

    private label: string;
    private verticalLSettings: VerticalLayoutSettings;
    private open: boolean = false;
    private isPressed = false;
    private isLeave: boolean =false;

    constructor(id: number, label: string, settings: TreeSettings) {
        super(id, settings);
        this.drawChildren = true;
        this.label = label;

        this.verticalLSettings = new VerticalLayoutSettings();
        this.verticalLSettings.needScrollBar = false;
        this.verticalLSettings.hasOwnDrawBatch = false;
        this.verticalLSettings.box.marginTop = 18;
        this.verticalLSettings.box.paddingTop = 0;
        this.verticalLSettings.box.paddingBottom = 0;
        this.setFromLocal();
    }

    setFromLocal() {
        let data = Local.getItem(this.id);
        if (data) {
            this.open = data.open;
        }
    }

    saveToLocal() {
        let a = {
            open: this.open,
        };

        Local.setItem(this.id, a);
    }

    updateCursor(comp: Component) {
        if (comp instanceof Tree || comp instanceof Group || comp instanceof VerticalLayout) {
            this.placeCursor.y +=
                +comp.settings.box.marginTop +
                comp.size.y +
                comp.settings.box.marginBottom;
        } else {
            this.placeCursor.y = 0;
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
        let settings = this.settings as TreeSettings;
        this.isPressed = UI_IC.treeTitle(this.label);

        //let open = UI_IC.groupTitle(this.label, this.open);
        /*if (open != this.open) {
            this.open = open;
            this.saveToLocal();
            this.setDirty(true);
        }*/

        if (!this.isLeave) {

            if (UI_IC.toggleIcon(
                "ib",
                this,
                "open",
                settings.iconOpen,
                settings.iconClose,
            )) {

                this.saveToLocal();
                this.setDirty(true);

            }
        }
        // UI_IC.dirtyButton("LSdb");
        //UI_I.popComponent();

        UI_IC.pushVerticalLayout("l", this.verticalLSettings);
        this.container = UI_I.currentComponent;

        this.container.drawChildren = this.open;
    }

    getReturnValue(): any {
        if (this.isPressed) {
            this.isPressed = false
            return true;
        }
        return false
    }

    setLeave(isLeave: boolean) {
        if(this.isLeave !=isLeave){
            this.isLeave =isLeave

            this.setDirty();
        }



    }
}
