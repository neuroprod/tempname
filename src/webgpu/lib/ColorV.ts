import {Vector4} from "@math.gl/core";


export default class ColorV extends Vector4 {



  get r(): number {
    return this[0];
  }
  set r(value: number) {
    this[0] = value;
  }

  get g(): number {
    return this[1];
  }
  set g(value: number) {
    this[1] = value;
  }

  get b(): number {
    return this[2];
  }
  set b(value: number) {
    this[2] = value;
  }

  get a(): number {
    return this[3];
  }
  set a(value: number) {
    this[3] = value;
  }

  public setHex(hex: string, a = 1) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
      this.r = parseInt(result[1], 16) / 255;
      this.g = parseInt(result[2], 16) / 255;
      this.b = parseInt(result[3], 16) / 255;
    }

    this.a = a;
    return this;
  }

  gray(val: number) {
    this.r = val;
    this.g = val;
    this.b = val;
    return this;
  }
}
