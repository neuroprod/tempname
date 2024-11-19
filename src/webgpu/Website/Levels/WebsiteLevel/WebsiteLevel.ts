import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
;

import {Vector3} from "@math.gl/core";
import UI from "../../../lib/UI/UI.ts";
import WebsiteShow from "./WebsiteShow.ts";





export class WebsiteLevel extends BaseLevel{



    private websiteShow =new WebsiteShow()

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

        this.levelObjects.gameRenderer.setModels(SceneHandler.allModels)
        this.setMouseHitObjects( SceneHandler.mouseHitModels);


        this.levelObjects.gameCamera.setLockedView(new Vector3(0,0,0),new Vector3(0,0,1))

        this.levelObjects.gameRenderer.setLevelType("website")

        window.scrollTo(0, 0);
        document.body.style.overflow="visible"


        let webSiteRoot =SceneHandler.getSceneObject("rootWebsite")
        this.websiteShow.setObjects(webSiteRoot.children)

        this.websiteShow.show()



    }
    destroy() {
        super.destroy();
        window.scrollTo(0, 0);
        document.body.style.overflow="hidden"
        this.websiteShow.destroy()
    }

    onUI(){
      //  UI.LFloatSlider(this,"sphereBlend",0,1)
    }
    update() {
        super.update();
        let t =document.body.getBoundingClientRect().top
        let  p =- Math.abs(t/2000)
        this.levelObjects.gameCamera.setLockedView(new Vector3(0,p,0),new Vector3(0,p,1));

       // this.websiteSphere.update(this.sphereBlend)
    }


}
