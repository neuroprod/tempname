import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import Camera from "../lib/Camera.ts";
import ModelRenderer from "../lib/model/ModelRenderer.ts";


import UI from "../lib/UI/UI.ts";
import Ray from "../lib/Ray.ts";
import Outline from "./outline/Outline.ts";
import EditCursor from "./editCursor/EditCursor.ts";
import EditCamera from "./EditCamera.ts";
import SceneObject3D from "./SceneObject3D.ts";

import GameRenderer from "../render/GameRenderer.ts";

import AnimationEditor from "./timeline/AnimationEditor.ts";

import {popSplitPanel, pushSplitPanel} from "../UI/SplitPanel.ts";
import SplitNode from "../UI/SplitNode.ts";
import {DockSplit} from "../lib/UI/docking/DockType.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {popMainMenu, pushMainMenu} from "../UI/MainMenu.ts";
import {addMainMenuButton} from "../UI/MainMenuButton.ts";
import {Icons} from "../UI/Icons.ts";
import {addMainMenuDivider} from "../UI/MainMenuDivider.ts";
import {addMainMenuToggleButton} from "../UI/MainMenuToggleButton.ts";
import {addMainMenuTextButton} from "../UI/MainMenuTextButton.ts";
import {popPanelMenu, pushPanelMenu} from "../UI/PanelMenu.ts";
import {addInputText} from "../UI/InputText.ts";
import SceneData from "../data/SceneData.ts";
import {addMeshPopup} from "../UI/AddMeshPopup.ts";
import {addPlayButton, addRecButton} from "../UI/PlayPauzeRecButton.ts";
import {MainMenuOffset} from "../UI/Style.ts";
import {saveScene} from "../lib/SaveUtils.ts";
import {setNewPopup} from "../UI/NewPopup.ts";
import Animation from "./timeline/animation/Animation.ts";
import {setAnimePopup} from "../UI/AnimePopup.ts";

export enum ToolState {

    translate,
    rotate,
    scale,

}

class SceneEditor {


    public modelsByLoadID: { [id: string]: SceneObject3D } = {};
    gameRenderer!: GameRenderer;
    private renderer!: Renderer;
    private camera!: Camera;
    private modelRenderer!: ModelRenderer;
    private root!: SceneObject3D

    private mouseListener!: MouseListener;
    private ray: Ray = new Ray();
    currentModel: SceneObject3D | null = null;
    private outline!: Outline;
    private editCursor!: EditCursor;
    private editCamera!: EditCamera;
    private currentToolState: ToolState = ToolState.translate;


    private rootSplit!:SplitNode
    private nodeCenter!: SplitNode;
    private nodeRight!: SplitNode;
    private nodeRightTop!: SplitNode;
    private nodeRightBottom!: SplitNode;
    private nodeTop!: SplitNode;
    private nodeBottom!: SplitNode;


    private numFrames ="60"

    constructor() {
    }
    init(renderer: Renderer, mouseListener: MouseListener, camera:Camera,gameRenderer:GameRenderer) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera = camera

        this.gameRenderer = gameRenderer;





        this.modelRenderer = new ModelRenderer(renderer, "mainModels", this.camera)
        this.modelRenderer.setModels(SceneData.usedModels);


        this.outline = new Outline(renderer, this.camera)
        this.editCursor = new EditCursor(renderer, this.camera, mouseListener, this.ray)
        this.editCamera = new EditCamera(renderer, this.camera, mouseListener, this.ray)
        this.root = SceneData.root;


        AnimationEditor.setAnimation(SceneData.animations[0])

        this.setCurrentToolState(ToolState.translate)

        this.rootSplit =new SplitNode("root")

        let a = this.rootSplit.split(DockSplit.Horizontal,"top","bottom")
        this.nodeTop =a[0];
        this.nodeBottom =a[1];

      let b =  this.nodeTop.split(DockSplit.Vertical,"center","right")
        this.nodeCenter =b[0];
        this.nodeRight =b[1];

        let c =  this.nodeRight.split(DockSplit.Horizontal,"rightTop","rightLeft");
        this.nodeRightTop =c[0];
        this.nodeRightBottom =c[1];


    }

    update() {
        this.camera.ratio = this.renderer.ratio

        //setScreenRay
        this.ray.setFromCamera(this.camera, this.mouseListener.getMouseNorm())

        //checkCameraInteraction
        let cursorNeeded = false
        cursorNeeded = this.editCamera.checkMouse();
        //check edit cursor
        if (!cursorNeeded) {
            cursorNeeded = this.editCursor.checkMouse()
        }
        //check modelSelect
        if (!cursorNeeded && this.mouseListener.isDownThisFrame && !UI.needsMouse()) {
            let intersections = this.ray.intersectModels(this.gameRenderer.gBufferPass.modelRenderer.models)
            if (intersections.length) {
                let m = intersections[0].model;
                this.setCurrentModel(m.parent as SceneObject3D)

            } else {
                this.setCurrentModel(null);

            }
        }

        this.editCursor.update()
       AnimationEditor.update();
    }
    onUINice() {
        pushMainMenu("tools",300,MainMenuOffset);


        if (addMainMenuButton("Add", Icons.PLUS_CUBE,true)){

            let name ="root"
            if(this.currentModel){
                name = this.currentModel.label
            }

            addMeshPopup("Add Object to "+name,this.addModel.bind(this))
        }
        if (addMainMenuButton("Remove", Icons.MIN_CUBE,true)){
            if(this.currentModel){
                this.removeModel(this.currentModel)
            }
        }

        addMainMenuDivider("tooldDiv2")


        if ( addMainMenuToggleButton("Move", Icons.MOVE,this.currentToolState == ToolState.translate)) this.setCurrentToolState(ToolState.translate);
        if (addMainMenuToggleButton("Rotate", Icons.ROTATE,this.currentToolState == ToolState.rotate)) this.setCurrentToolState(ToolState.rotate);
        if (addMainMenuToggleButton("Scale", Icons.SCALE,this.currentToolState == ToolState.scale)) this.setCurrentToolState(ToolState.scale);

        popMainMenu()

        pushSplitPanel("horizontal panel",  this.nodeBottom,false);
        pushPanelMenu("animationMenu")
        if(addMainMenuButton("AddAnime", Icons.ADD_ANIME,true)){

            if(!this.currentModel)return;

            setNewPopup("+ Add new Anime to "+this.currentModel.label, "new_anime", (name: string) => {
                    if(!this.currentModel)return;
                    let anime = new Animation(this.renderer, name, this.currentModel)
                    SceneData.animations.push(anime)
                    AnimationEditor.setAnimation(anime)
            })

        }
        if(addMainMenuButton("RemoveAnime",  Icons.REMOVE_ANIME,true)){
            if(AnimationEditor.currentAnimation){
                SceneData.removeAnimation(AnimationEditor.currentAnimation)
                AnimationEditor.setAnimation(null);

            }
        }
        if(addMainMenuButton("open", Icons.FOLDER,true)){
            setAnimePopup("nenenne",SceneData.animations,(anime:Animation)=>{
                AnimationEditor.setAnimation(anime);

            })
        }
        if(AnimationEditor.currentAnimation){
            addMainMenuDivider("mydiv3")
            addInputText(AnimationEditor.currentAnimation.label,AnimationEditor.currentAnimation,"label",false,3,0,150)

            addMainMenuDivider("mydiv")
            if(addMainMenuButton("keyAll", Icons.KEYFRAME_MULT,true)){
                AnimationEditor.addKeysAll()
            }
            if(addMainMenuButton("key", Icons.KEYFRAME,true)){
                if(this.currentModel)
                AnimationEditor.addAllKeysToModel(this.currentModel)
            }
            if(addMainMenuButton("deletekey", Icons.DELETE_KEYFRAME,true)){
                AnimationEditor.deleteSelectedKeys()
            }
            addMainMenuDivider("mydiv2")
            if(addRecButton("record",AnimationEditor.isRecording)){


                    AnimationEditor.isRecording=  !AnimationEditor.isRecording

            }
            if(addPlayButton("play", AnimationEditor.isPlaying)){


                if(AnimationEditor.isPlaying){
                    AnimationEditor.pause()
                }else{
                    AnimationEditor.play()
                }

            }
           // this.numFrames  =AnimationEditor.currentAnimation.numFrames+"";
            addInputText("numFrames",this,"numFrames",false,2,0,70)
            if(this.numFrames!= AnimationEditor.currentAnimation.numFrames+""){
                AnimationEditor.currentAnimation.numFrames =Number.parseFloat(this.numFrames);


            }
        }


        popPanelMenu()
        AnimationEditor.onUI();
        popSplitPanel()

        pushSplitPanel("Top panel",  this.nodeRightTop);

        this.root.onUINice(0)
        popSplitPanel()

        pushSplitPanel("bottom panel",  this.nodeRightBottom);

        if(this.currentModel) {
            this.currentModel.onDataUI()
        }
        popSplitPanel()


        this.rootSplit.setDividers();

        let s = UI_I.pixelSize.clone()
        s.x-=20
        s.y-=20
        if (this.rootSplit.resize(s)) {
         this.rootSplit.updateLayout();
        }



    }

    public saveAll(){
       let sceneData: Array<any> = []
        SceneData.root.getSceneData(sceneData);

        let animationData: Array<any> = []
        for (let a of SceneData.animations) {
            a.getAnimationData(animationData);
        }
        let data: any = {}
        data.scene = sceneData;
        data.animation = animationData;
        saveScene("scene1", JSON.stringify(data)).then(()=>{
            console.log("saved Scene")
        })



    }




    setCurrentModel(value: SceneObject3D | null) {
        if (value) {
            this.currentModel = value;

            this.outline.setCurrentModel(value.model)
            this.editCursor.setCurrentModel(this.currentModel);
            AnimationEditor.setCurrentModel(this.currentModel);
        } else {
            this.currentModel = null;
            this.outline.setCurrentModel(null);
            this.editCursor.setCurrentModel(null);
            AnimationEditor.setCurrentModel(null);
        }

    }

    draw() {
        this.outline.draw()

        this.gameRenderer.draw();
    }

    drawInCanvas(pass: CanvasRenderPass) {
        //  this.modelRenderer.draw(pass);
        this.gameRenderer.drawFinal(pass);
        this.outline.drawFinal(pass);
        this.editCursor.drawFinal(pass);
    }

    public removeModel(m: SceneObject3D) {
        this.setCurrentModel(null)
        for (let child of m.children) {
            let childSceneObject = child as SceneObject3D
            if (childSceneObject.isSceneObject3D) {
                this.removeModel(childSceneObject)
            } else {
                //console.log(child)
            }

        }
        if (m.model) {
            this.gameRenderer.gBufferPass.modelRenderer.removeModel(m.model)
           // this.gameRenderer.shadowMapPass.modelRenderer.removeModel(m.model)
            this.gameRenderer.shadowMapPass.removeSceneObject(m);
            m.removeChild(m.model)
            m.model = null
        }
        if (m.parent) m.parent.removeChild(m)

    }

    public addModel(m: SceneObject3D) {
        if(!this.currentModel)this.currentModel =SceneData.root
        m.setUniqueName(this.root.getUniqueName(m.label))

        this.currentModel.addChild(m)
        if (m.model) {
            this.gameRenderer.gBufferPass.modelRenderer.addModel(m.model)
            this.gameRenderer.shadowMapPass.addSceneObject(m);
            //this.gameRenderer.shadowMapPass.modelRenderer.addModel(m.model)
            //shadowPassclip

            //transparentPass

        }

        this.setCurrentModel(m)
    }



    private setCurrentToolState(toolState: ToolState) {
        this.currentToolState = toolState;
        this.editCursor.setToolState(this.currentToolState);
    }


    setActive() {
        this.editCamera.setCamera()
    }
}
export default new SceneEditor();
