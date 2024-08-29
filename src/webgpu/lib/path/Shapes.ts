import {Vector3} from "@math.gl/core";
import Path from "./Path.ts";

export function drawCircle(path:Path,pos:Vector3, radius:number){
    let cpOff = 0.552284749831*radius
    let cp1 = new Vector3()
    let cp2 = new Vector3()
    let p =pos.clone();
    p.x+=radius

    path.moveTo(p.clone())
    cp1.copy(p);
    cp1.y+=cpOff;
    p.copy(pos);
    p.y +=radius;
    cp2.copy(p)
    cp2.x+=cpOff;

    path.bezierCurveTo(cp1.clone(),cp2.clone(),p.clone())
    cp1.copy(p);
    cp1.x-=cpOff;
    p.copy(pos);
    p.x -=radius;
    cp2.copy(p);
    cp2.y+=cpOff;
    path.bezierCurveTo(cp1.clone(),cp2.clone(),p.clone())

    cp1.copy(p);
    cp1.y-=cpOff;
    p.copy(pos);
    p.y -=radius;
    cp2.copy(p);
    cp2.x-=cpOff;
    path.bezierCurveTo(cp1.clone(),cp2.clone(),p.clone())

    cp1.copy(p);
    cp1.x+=cpOff;
    p.copy(pos);
    p.x +=radius;
    cp2.copy(p);
    cp2.y-=cpOff;
    path.bezierCurveTo(cp1.clone(),cp2.clone(),p.clone())
}
