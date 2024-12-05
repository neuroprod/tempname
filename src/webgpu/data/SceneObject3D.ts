import Object3D from "../lib/model/Object3D.ts";
import Renderer from "../lib/Renderer.ts";
import UI from "../lib/UI/UI.ts";
import Model from "../lib/model/Model.ts";
import AnimationEditorGroup from "../sceneEditor/timeline/AnimationEditorGroup.ts";
import AnimationEditor from "../sceneEditor/timeline/AnimationEditor.ts";
import {TreeSettings} from "../lib/UI/components/Tree.ts";
import {popObjectTree, pushObjectTree} from "../UI/ObjectTree.ts";
import SceneEditor from "../sceneEditor/SceneEditor.ts";
import {DEG2RAD, RAD2DEG, sqDistToLineSegment} from "../lib/MathUtils.ts";
import DebugDraw from "../Website/DebugDraw.ts";
import {Vector3, Vector4} from "@math.gl/core";
import {HitTrigger, HitTriggerSelectItems} from "./HitTriggers.ts";

import FontMesh from "../modelMaker/FontMesh.ts";

import ProjectData from "./ProjectData.ts";
import SceneHandler from "./SceneHandler.ts";
import ColorV from "../lib/ColorV.ts";


export default class SceneObject3D extends Object3D {


    private static emptyTreeSettings: TreeSettings;
    setCurrentModel!: (value: (SceneObject3D | null)) => void;
    public isSceneObject3D = true
    model: Model | null = null;
    projectId: string = "";
    meshId: string = "";

    isText: boolean = false;
    text: string = ""
    textColor:ColorV =new ColorV(0,0,0,1)
    needsHitTest = false;
    needsTrigger: boolean = false;
    needsMouseHit: boolean = false;
    dropShadow:boolean =true;
    mouseHitID: string = ""
    public triggerIsEnabled = true;
    hitTriggerItem: HitTrigger = HitTrigger.NONE;
    triggerRadius = 0.2
 lockScaleXY: boolean = false;

    posEditor:Vector3=new Vector3()
    rotEditor:Vector3=new Vector3()
    constructor(renderer: Renderer, label: string) {
        super(renderer, label);
        if (!SceneObject3D.emptyTreeSettings) {
            SceneObject3D.emptyTreeSettings = new TreeSettings();
            SceneObject3D.emptyTreeSettings.btnColor.setHex("#6e4e4e", 1)
        }
    }
    setEditorValues(){
        this.posEditor.from(this._position)
        this.rotEditor.from(this.euler)
    }
    get rxD() {
        return this.rx * RAD2DEG;
    }

    set rxD(value) {

        this.rx = value * DEG2RAD
    }

    get ryD() {
        return this.ry * RAD2DEG;
    }

    set ryD(value) {
        this.ry = value * DEG2RAD
    }

    get rzD() {
        return this.rz * RAD2DEG;
    }

    set rzD(value) {
        this.rz = value * DEG2RAD
    }

    onUINice(depth: number) {
        let leave = false;
        if (this.children.length <= 1) {
            leave = true;
            if (this.children.length == 1 && (this.children[0] as SceneObject3D).isSceneObject3D) {
                leave = false;
            }
        }

        if (pushObjectTree(this.label, leave, depth, this == SceneEditor.currentModel)) {
            SceneEditor.setCurrentModel(this);
        }
        // if(pushObjectTree(this.label,this.children.length<=1).clicked){

        //}
        depth++;

        for (let child of this.children) {
            let co = child as SceneObject3D;
            if (co.onUINice) co.onUINice(depth)
        }
        popObjectTree();
    }

    checkTriggerHit(bottomPos: Vector3, topPos: Vector3, radius: number) {
        if (!this.triggerIsEnabled) return false;
        let dsq = sqDistToLineSegment(bottomPos, topPos, this.getWorldPos())

        let r = this.triggerRadius + radius;
        if (dsq < (r * r)) {

            return true
        }
        return false;
    }

    drawTrigger() {
        if (!this.triggerIsEnabled) return
        DebugDraw.drawCircle(this.getWorldPos(), this.triggerRadius)
    }

    public setText(s:string,color:Vector4 =new Vector4()){
        if (s != this.text && this.model) {
        this.text = s;
        let m = this.model.mesh as FontMesh;
        m.setText(this.text, ProjectData.font)
            console.log("fix this")
        }

    }
    onDataUI() {
        UI.pushID(this.UUID)
        UI.LTextInput("name", this, "label")


        UI.LFloat(this, "x", "Position X")
        UI.LFloat(this, "y", "Y")
        UI.LFloat(this, "z", "Z")

        UI.LFloat(this, "rxD", "Rotation X")
        UI.LFloat(this, "ryD", "Y")
        UI.LFloat(this, "rzD", "Z")
        if (this.model) {
            this.lockScaleXY = UI.LBool(this, "lockScaleXY")
            if (this.lockScaleXY) {
                UI.LFloat(this.model, "sx", "Scale XY")
                this.model.sy = this.model.sx;
            } else {
                UI.LFloat(this.model, "sx", "Scale X")
                UI.LFloat(this.model, "sy", "Y")
            }

            UI.LFloat(this.model, "sz", "Z")
        }
        if (this.model) {
            this.needsHitTest = UI.LBool(this, "needsHitTest");
        }
        this.needsTrigger = UI.LBool(this, "needsTrigger");
        if (this.needsTrigger) {
            UI.LFloat(this, "triggerRadius", "TriggerRadius")
            this.drawTrigger();

            this.hitTriggerItem = UI.LSelect("trigger", HitTriggerSelectItems, this.hitTriggerItem)


        }
        this.dropShadow = UI.LBool(this, "dropShadow");
        if (this.model) {
            this.needsMouseHit = UI.LBool(this, "needsMouseHit");
            if (this.needsMouseHit) {
                UI.LTextInput("mouseHitID", this, "mouseHitID")
            }
        }
        if (this.isText) {
            let t = UI.LTextInput("text", this.text)
            if(t!=this.text){
                this.text =t
                if(this.model){
                    let text =this.text
                    if(text.startsWith("#")){

                        let id = text.slice(1)
                        let copy =ProjectData.copy[id]

                        if(copy){
                            text=copy;
                        }
                    }

                    (this.model.mesh as FontMesh).setText(text, ProjectData.font);
                }

            }


            let tc = UI.LColor("textColor", this.textColor)
            if( this.model) {
                this.model.material.setUniform("color", this.textColor)
            }
        }
        UI.popID()
    }

    setObjectData(obj: any) {
        this.needsHitTest = obj.needsHitTest;
        this.needsTrigger = obj.needsTrigger;
        this.triggerRadius = obj.triggerRadius;
        this.hitTriggerItem = obj.hitTriggerItem
        if(obj.needsMouseHit){
            this.needsMouseHit = obj.needsMouseHit
            this.mouseHitID = obj.mouseHitID
        }
        if(obj.dropShadow !=undefined){
            this.dropShadow = obj.dropShadow

        } if(obj.lockScaleXY !=undefined){
            this.lockScaleXY = obj.lockScaleXY

        }
        if(obj.textColor !=undefined){
          this.textColor.r  =obj.textColor[0]
            this.textColor.g  =obj.textColor[1]
            this.textColor.b  =obj.textColor[2]
            this.textColor.a  =obj.textColor[3]
if(this.isText && this.model){
    this.model.material.setUniform("color",this.textColor)
}

        }

    }

    getObjectData(dataArr: Array<any>) {
        let obj: any = {}
        obj.id = this.UUID;
        obj.needsHitTest = this.needsHitTest;
        obj.label = this.label;
        obj.meshId = this.meshId;
        obj.projectId = this.projectId;
        obj.isText = this.isText;
        obj.text = this.text;
        obj.needsTrigger = this.needsTrigger;
        obj.triggerRadius = this.triggerRadius
        obj.mouseHitID = this.mouseHitID
        obj.needsMouseHit = this.needsMouseHit
        obj.position = this.getPosition()
        obj.rotation = this.getRotation()
        obj.hitTriggerItem = this.hitTriggerItem
        obj.lockScaleXY =this.lockScaleXY
        obj.dropShadow = this.dropShadow
        obj.textColor =[this.textColor.r,this.textColor.g,this.textColor.b,this.textColor.a]
        if (this.model) {
            obj.model = this.model.label
            obj.scale = this.model.getScale();
        }

        if (this.parent) obj.parentID = this.parent.UUID
        dataArr.push(obj);

        for (let child of this.children) {
            let co = child as SceneObject3D;
            if (co.getObjectData) co.getObjectData(dataArr);
        }
    }

    makeAnimationGroups(root: AnimationEditorGroup) {
        let group = new AnimationEditorGroup(this.label, this)
        root.addGroup(group)

        AnimationEditor.models.push(this);

        for (let child of this.children) {
            let childSceneObject = child as SceneObject3D;

            if (childSceneObject.isSceneObject3D) {


                childSceneObject.makeAnimationGroups(group)
            }

        }

    }

    setUniqueName(uniqueName: string) {
        this.label = uniqueName
        if (this.model) {
            this.model.label = "model_" + uniqueName;
        }
    }

    getUniqueName(name: string) {
        let n = name;
        let count = 2;
        while (this.checkName(n)) {
            n = name + "_" + count;
            count++
        }
        return n;

    }

    checkName(name: string) {
        if (this.label == name) {
            return true;
        }
        for (let c of this.children) {
            let f = c as SceneObject3D;
            if (f.isSceneObject3D) {
                if (f.label == name) return true;
                if (f.checkName(name)) return true;
            }
        }
        return false;

    }
    show() {
        if (this.model) this.model.visible = true
    }

    hide() {
        if (this.model) this.model.visible = false
    }
    isShowning(){

        if (this.model) return this.model.visible
        return false;
    }

    copy(label: string) {

        if(this.isText){
            let m = ProjectData.makeSceneObjectWithText(label,this.text)
            this.copyProperties(m)
            this.parent?.addChild(m);
            if (this.model && m?.model) {
                this.model.copyProperties(m?.model)
            }
            m.setEditorValues()
            return m;
        }else{
            let m = ProjectData.getModel({label:label,projectId: this.projectId, meshId:this.meshId,id:""})
            if (m) {
                this.copyProperties(m)
                m.setEditorValues()
                this.parent?.addChild(m);
            }
            if (this.model && m?.model) {
                this.model.copyProperties(m?.model)
            }
            return m;
        }

        return null;


    }

    copyProperties(target: SceneObject3D) {
        super.copyProperties(target)
        target.needsTrigger = this.needsTrigger
        target.triggerIsEnabled = this.triggerIsEnabled
        target.hitTriggerItem = this.hitTriggerItem
        target.triggerRadius = this.triggerRadius


    }
    destroy() {
        super.destroy();

    }
}
