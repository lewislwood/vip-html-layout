
import { initKH, KH_Key } from "./lwkh"; 


//   name: LW-Help
// Date: 5/7/2024

// description: Integrates with the LW-KH, keyboard handler.
//              Uses the KeyTest array to generate tables for the various categories of MediaKeySession[Symbol] Tables will have 2 columns Standard and Screen reader MediaKeySession[Symbol]        
// Attaches to the body  and displays as MediaSessionActionHandler.
type CategoryKeys = {
    category: string;
    description: string;
    standard?: string;
    alternate?: string;
}

export class LwHelp {
    private helpCategories = new Map <string,  CategoryKeys>();
constructor(){
console.log("started help");
} // constructor
public async setKeyTables() {
    const kh = initKH();
    const keys: KH_Key[] = kh.keyTesters;
keys.forEach((k)=>{
this.addKey(k);
})


};  // setKeyTables

private addKey( k:KH_Key) {
const srch = `${k.category ?? "general"}.${k.desc}`;
let kat:CategoryKeys

    if (!this.helpCategories.has(srch)) {kat = { category: k.category ?? "general", description: k.desc ?? "" };this.helpCategories.set(srch , kat); }
     else kat = this.helpCategories.get(srch)!;

const kd = this.keyDesc(k);
const alt: boolean = /alt$/.test(k.name);
if (alt === true) kat.alternate = kd
    else kat.standard = kd;



} //addKey

private keyDesc(k:KH_Key): string {
const desc: string[]  = [];

if (k.ctrlKey === true) desc.push("ctrl");
if (k.altKey  === true) desc.push("alt");
if (k.metaKey === true) desc.push("win") ;
if (k.shiftKey === true) desc.push("shift");
desc.push(k.key);
return desc.join("+");
}; // keyDesc



public showHelp() {
    const kh = initKH();
    const keys: KH_Key[]  = kh.keyTesters;

if (this.helpCategories.has("testing")) alert("you be crazy");
alert(`There are ${keys.length} to define! `)
    }

} // class lwHelp

