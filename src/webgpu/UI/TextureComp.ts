import Component, {ComponentSettings} from "../lib/UI/components/Component.ts";

import Texture from "../lib/textures/Texture.ts";
import UI_I from "../lib/UI/UI_I.ts";



export function addTexture(label:string,texture:Texture){



    if (!UI_I.setComponent(label)) {
        let settings =new ComponentSettings()
        settings.box.size.set(-1,-1)
       // settings.hasBackground =true;

        let comp = new TextureComp (
            UI_I.getID(label), settings,
            texture,

        );
        UI_I.addComponent(comp);
    }




}


export default class TextureComp extends Component{
    private texture: Texture;

    constructor(id:number, settings:ComponentSettings,texture:Texture) {
        super(id,settings);
        this.texture =texture;
    }
    prepDraw() {
        super.prepDraw();


        UI_I.currentDrawBatch.textureBatch.addTexture(this.layoutRect,this.texture)
    }


}
