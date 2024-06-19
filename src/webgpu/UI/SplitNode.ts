import Vec2 from "../lib/UI/math/Vec2.ts";
import Rect from "../lib/UI/math/Rect.ts";

import {DockSplit} from "../lib/UI/docking/DockType.ts";
import {SplitPanel} from "./SplitPanel.ts";

import {setSplitDivider, SplitDivider, SplitDividerSettings} from "./SplitDevider.ts";

export default class SplitNode{




    public border = 10;
    public size: Vec2 = new Vec2();
    public pos: Vec2 = new Vec2(10,10);
    public rect = new Rect();
    public panelID = 0;
    public panel: SplitPanel | null = null;
    public children: Array<SplitNode> = [];
    public parent: SplitNode | null = null;
    public id: number;
    public splitType: DockSplit =DockSplit.Center ;
    private name: string;


    private divider!: SplitDivider;
    private dividerPos: Vec2 = new Vec2();
    private dividerMin: Vec2 = new Vec2();
    private dividerMax: Vec2 = new Vec2();

    constructor(name:string) {
        this.name= name;

    }

    setDividers() {
        if (this.children.length) {
            this.divider = setSplitDivider(this.name,new SplitDividerSettings(this.splitType))

            this.divider.place(
                this,
                this.dividerPos,
                this.dividerMin,
                this.dividerMax
            );
        }

        for (let child of this.children) {
            child.setDividers();
        }
    }

    public split(splitType:DockSplit,name1:string,name2:string ):[SplitNode,SplitNode]{

        this.splitType =splitType;

        let child1 = new SplitNode(name1);
        child1.parent = this;
        this.children.push(child1);

        let child2 = new SplitNode(name2);
        child2.parent = this;
        this.children.push(child2);
        return [child2,child1]

    }


    setPanel(panel:SplitPanel) {

        this.panel =panel;
        this.size.copy(this.panel.size)
        this.updateRootLayout()
    }

    resize(size:Vec2,force=false) {
        if(size.equal(this.size) && !force)return false;

        this.size.copy(size);
///console.log(this.size,this.pos);
        if (!this.children.length) return true;

        let totalWidth =
            this.children[0].size.x + this.children[1].size.x + this.border;
        let totalHeight =
            this.children[0].size.y + this.children[1].size.y + this.border;

        //2panels
        if (
            (this.children[0].panel || this.children[0].children.length) &&
            (this.children[1].panel || this.children[1].children.length)
        ) {

            ///resize even
            let factorX = this.children[0].size.x / totalWidth;
            let factorY = this.children[0].size.y / totalHeight;

            let size0 = new Vec2(this.size.x * factorX, this.size.y * factorY);
            let size1 = this.size.clone().sub(size0);

            if (this.splitType == DockSplit.Vertical) {
                size1.x -= this.border;
                size0.y = size1.y = this.size.y;
                if (this.children[0].pos.x < this.children[1].pos.x) {
                    this.children[0].pos = this.pos.clone();
                    this.children[1].pos = this.pos.clone();
                    this.children[1].pos.x += size0.x + this.border;
                } else {
                    this.children[1].pos = this.pos.clone();
                    this.children[0].pos = this.pos.clone();
                    this.children[0].pos.x += size1.x + this.border;
                }
            } else {
                size1.y -= this.border;
                size0.x = size1.x = this.size.x;

                if (this.children[0].pos.y < this.children[1].pos.y) {
                    this.children[0].pos = this.pos.clone();
                    this.children[1].pos = this.pos.clone();
                    this.children[1].pos.y += size0.y + this.border;
                } else {
                    this.children[1].pos = this.pos.clone();
                    this.children[0].pos = this.pos.clone();
                    this.children[0].pos.y += size1.y + this.border;
                }
            }

            this.children[0].resize(size0,force);
            this.children[1].resize(size1,force);

        }
        //1 panel
        else{

            let panelSize: Vec2 = new Vec2();
            let clearSize: Vec2 = new Vec2();
            let panelChild = this.children[0];
            let clearChild = this.children[1];
            if (this.children[1].panel) {
                panelChild = this.children[1];
                clearChild = this.children[0];
            }
            if (this.splitType == DockSplit.Vertical) {
                panelSize.y = clearSize.y = this.size.y;
                panelSize.x = panelChild.size.x;
                if(panelSize.x==0)panelSize.x = this.size.x/2
                clearSize.x = this.size.x - panelSize.x - this.border;
                if (clearSize.x < 0) return;

                if (panelChild.pos.x < clearChild.pos.x) {
                    panelChild.pos = this.pos.clone();
                    clearChild.pos = this.pos.clone();
                    clearChild.pos.x += panelSize.x + this.border;
                } else {
                    clearChild.pos = this.pos.clone();
                    panelChild.pos = this.pos.clone();
                    panelChild.pos.x += clearSize.x + this.border;
                }
            } //horizontal
            else {
                panelSize.x = clearSize.x = this.size.x;
                panelSize.y = panelChild.size.y;
                if(panelSize.y==0)panelSize.y = this.size.y/2
                clearSize.y = this.size.y - panelSize.y - this.border;

                if (clearSize.y < 0) return;
                if (panelChild.pos.y < clearChild.pos.y) {
                    panelChild.pos = this.pos.clone();
                    clearChild.pos = this.pos.clone();
                    clearChild.pos.y += panelSize.y + this.border;
                } else {
                    clearChild.pos = this.pos.clone();
                    panelChild.pos = this.pos.clone();
                    panelChild.pos.y += clearSize.y + this.border;
                }
            }

            panelChild.resize(panelSize,force);
            clearChild.resize(clearSize,force);

        }
        return true;
    }

    updateLayout() {

        if (this.panel) {

           this.panel.posOffset.copy(this.pos);
            this.panel.size.copy(this.size);
            this.panel.setDirty();
        }
        for (let child of this.children) {
            child.updateLayout();
        }
        if (this.children.length) {
            this.dividerPos = this.pos.clone().add(this.size.clone().scale(0.5));
            this.dividerMin = this.dividerPos.clone();
            this.dividerMax = this.dividerPos.clone();
            if (this.splitType == DockSplit.Vertical) {
                let leftChild = this.children[0];
                if (this.children[0].pos.x > this.children[1].pos.x) {
                    leftChild = this.children[1];
                }

                this.dividerPos.x =
                    leftChild.pos.x + leftChild.size.x + this.border / 2;
                this.dividerMin.x = this.pos.x + 50;
                this.dividerMax.x = this.pos.x + this.size.x - 50;
            } else {
                let topChild = this.children[0];
                if (this.children[0].pos.y > this.children[1].pos.y) {
                    topChild = this.children[1];
                }

                this.dividerPos.y =
                    topChild.pos.y + topChild.size.y + this.border / 2;
                this.dividerMin.y = this.pos.y + 50;
                this.dividerMax.y = this.pos.y + this.size.y - 50;
            }
        }
    }

    setDividerPos(newPos: Vec2) {
        let size = newPos.clone().sub(this.pos);
        size.x -= this.border / 2;
        size.y -= this.border / 2;
        if (this.splitType == DockSplit.Vertical) {
            let leftChild = this.children[0];
            let rightChild = this.children[1];
            if (this.children[0].pos.x > this.children[1].pos.x) {
                leftChild = this.children[1];
                rightChild = this.children[0];
            }

            leftChild.size.x = size.x;
            rightChild.size.x = this.size.x - leftChild.size.x - this.border;
            this.resize(this.size, true);
        }
        if (this.splitType == DockSplit.Horizontal) {
            let topChild = this.children[0];
            let bottomChild = this.children[1];
            if (this.children[0].pos.y > this.children[1].pos.y) {
                topChild = this.children[1];
                bottomChild = this.children[0];
            }

            topChild.size.y = size.y - this.border / 2;
            bottomChild.size.y = this.size.y - topChild.size.y - this.border;
            this.resize(this.size, true);
        }
        this.updateRootLayout();

    }
    private updateRootLayout(){
        if(this.parent){
            this.parent.updateRootLayout()
        }else{
            this.resize(this.size,true)
            this.updateLayout();
        }

    }
}
