import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
;

import {Vector3} from "@math.gl/core";
import UI from "../../../lib/UI/UI.ts";





export class WebsiteLevel extends BaseLevel{





    init() {
        super.init();
        LoadHandler.onComplete =this.configScene.bind(this)
        LoadHandler.startLoading()



        SceneHandler.setScene("1f78eea8-a005-4204").then(() => {

            LoadHandler.stopLoading()
        })

    }

    configScene() {

        LoadHandler.onComplete =()=>{}

        this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
        this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)

        this.setMouseHitObjects( SceneHandler.mouseHitModels);


        this.levelObjects.gameCamera.setLockedView(new Vector3(0,0,0),new Vector3(0,0,1))

        let webSiteRoot =SceneHandler.getSceneObject("rootWebsite")
        console.log(webSiteRoot.children);

    }
    onUI(){
        UI.LFloatSlider("test",0,0,1)
    }
    update() {
        super.update();
        let t =document.body.getBoundingClientRect().top
        let  p =- Math.abs(t/2000)
        this.levelObjects.gameCamera.setLockedView(new Vector3(0,p,0),new Vector3(0,p,1))

    }


}
