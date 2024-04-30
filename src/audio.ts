import { initKH, KH_Key } from "./lwkh";
import { initAP, LwAP } from "./lwap";

let ap: LwAP, kh = initKH();



ap = await initAP();


let kb: KH_Key = kh.newKeyBlank;
// kb = { ...kb, name: "Next Theme", desc: "Toggles to the next Theme", altKey: true, shiftKey: true, key: "c", action: tg };
kh.addKeyTest(kb);
ap.stopAll();
