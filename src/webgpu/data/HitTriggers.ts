import SelectItem from "../lib/UI/math/SelectItem.ts";
import {EnumToSelectItem} from "../lib/UI/UIUtils.ts";

export enum HitTrigger
    {
        NONE,
        COIN,
        STRAWBERRY,


    }

export  const HitTriggerSelectItems:Array<SelectItem> =[]


export function makeHitTriggerSelectItems(){

    let temp  =EnumToSelectItem(HitTrigger)
    for(let t of temp){
        HitTriggerSelectItems.push(t)
    }





}
makeHitTriggerSelectItems();

