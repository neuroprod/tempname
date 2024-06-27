import PopUp, {PopUpSettings} from "../lib/UI/components/internal/popUps/PopUp.ts";
import UI_I from "../lib/UI/UI_I.ts";

import {MenuBGColor, PanelRadius, TextColorDefault} from "./Style.ts";

import Vec2 from "../lib/UI/math/Vec2.ts";
import {VerticalLayoutSettings} from "../lib/UI/components/VerticalLayout.ts";
import UI_IC from "../lib/UI/UI_IC.ts";

import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import {addTextButton} from "./MainMenuTextButton.ts";
import UI from "../lib/UI/UI.ts";
import {popPanelMenu, pushPanelMenuFill} from "./PanelMenu.ts";
import {addSelectorBox} from "./Selector.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import {addInputTextBox} from "./InputText.ts";
import Box from "../lib/UI/math/Box.ts";
import SceneData from "../data/SceneData.ts";
import Project from "../data/Project.ts";
import {addTitle} from "./Label.ts";
import ProjectMesh from "../data/ProjectMesh.ts";
import Mesh from "../lib/mesh/Mesh.ts";
import Texture from "../lib/textures/Texture.ts";


export function addMeshPopup(title: string, callBack: (item: SceneObject3D) => void) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let settings: PopUpSettings = new PopUpSettings()
    let width = 330
    let height = 310
    settings.box.size.set(width, height)
    settings.box.marginLeft = UI_I.pixelSize.x / 2 - width / 2;
    settings.box.marginTop = UI_I.pixelSize.y / 2 - height / 2;
    settings.box.paddingBottom = 25;
    settings.box.paddingTop = 40;
    let compPopup = new AddMeshPopup(
        UI_I.getID("colorPopup"),
        settings, title, callBack
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
}


export class AddMeshPopup extends PopUp {
    private title: string;

    private textPos = new Vec2();
    private callBack: (item: SceneObject3D) => void
    private vlSettings: VerticalLayoutSettings;
    private text = "myText"
    private newName = "myNewObject"
    private inputTextBox: Box;
    private selector1Box: Box;
    private selector2Box: Box;

    constructor(id: number, settings: PopUpSettings, title: string, callBack: (item: SceneObject3D) => void) {
        super(id, settings);
        this.title = title;

        this.vlSettings = new VerticalLayoutSettings();


        this.vlSettings.needScrollBar = false
        this.vlSettings.box.paddingLeft = 12
        this.vlSettings.box.marginRight = 8
        this.inputTextBox = new Box()
        this.inputTextBox.size.y = 33;
        this.inputTextBox.marginTop = this.inputTextBox.marginBottom = 4
        this.selector1Box = new Box()
        this.selector2Box = new Box()
        this.selector1Box.size.x = this.selector2Box.size.x = 152
        this.selector1Box.marginRight = 5


        this.selector1Box.size.y = this.selector2Box.size.y = 33

        SceneData.makeSelectItems()
        this.callBack = callBack;
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        this.textPos.copy(this.layoutRect.pos)
        this.textPos.x += 15
        this.textPos.y += 15


    }

    prepDraw() {
        //super.prepDraw();
        UI_I.currentDrawBatch.fillBatch.addRoundedRect(this.layoutRect, MenuBGColor, PanelRadius)
        UI_I.currentDrawBatch.sdfBatch.addLine(this.textPos, this.title, 14, TextColorDefault, false);
    }

    setSubComponents() {
        super.setSubComponents();
        UI_IC.pushVerticalLayout("vl", this.vlSettings);

        addInputTextBox("newModelName", this, "newName", true, this.inputTextBox);
        UI.separator("s0", false)

        if(addTextButton("add Empty"))
        {
            let a =new SceneObject3D(UI_I.renderer,this.newName)
            this.callBack(a);
            UI_I.removePopup(this)
        }

        UI.separator("s1", false)
        pushPanelMenuFill("myPanels", 33 + 5)


        let a = [new SelectItem("ffffff", "v"), new SelectItem("aaaaaa", "vf")]
        let m:ProjectMesh|null =null

            let p = addSelectorBox("test", SceneData.projectSelectItems, 0, this.selector1Box) as Project;

        if (p.selectItems.length > 0) {
            m = addSelectorBox(p.name + "randumS", p.selectItems, 0, this.selector2Box)
        }

        popPanelMenu()
        if(addTextButton("add Mesh")){
            if(m){

                let a  =SceneData.makeSceneObjectWithMesh(m.getMesh(),this.newName,p.baseTexture)
                this.callBack(a);
                UI_I.removePopup(this)
            }


        }

        UI.separator("s2", false)
        addInputTextBox("myTextInput", this, "text", false, this.inputTextBox);
        addTextButton("add Text")
        /*  for(let item of this.items){

              if(   addListButton(item.name)){
                  this.callBack(item);
                  UI_I.removePopup(this);
              }

          }*/


        UI_I.popComponent();

    }

}
