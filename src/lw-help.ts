
import { initKH, KH_Key } from "./lwkh"; 
import { getHelpData } from "./lw-help-data";


//   name: LW-Help
// Date: 5/7/2024
//  Author: Lewis L Wood

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
    private categoryKeys = new Map < string, CategoryKeys[]>(); 
    private dialog?:HTMLDialogElement;

constructor(){
} // constructor

private mergeStdAltKeys() {
    const helpCategories = new Map<string, CategoryKeys>();
    const kh = initKH();
    const keys: KH_Key[] = kh.keyTesters;
    keys.forEach((k) => {
        this.addKey(k, helpCategories);
    })
    const catKeys = this.categoryKeys;
    const sKeys = [...helpCategories.keys()].sort();
    sKeys.forEach((s) => {
        const cat = helpCategories.get(s)!;
        const category = cat.category;
        if (!catKeys.has(category)) catKeys.set(category, []);
        const keyList = catKeys.get(category);
        keyList?.push(cat);


    })

} //mergeStdAlt

private async getStyleElement():Promise<HTMLStyleElement> {
    const style = document.createElement("style");
    style.innerHTML =  await getHelpData('style');
return style;
};  //getStyleElement

private async getHeaderDiv():Promise<HTMLDivElement> {
    const div = document.createElement("div");
    div.innerHTML = await getHelpData("header");
    return div;
}  // getHeaderDiv

    private async getFooterDiv(): Promise<HTMLDivElement> {
        const div = document.createElement("div");
        div.innerHTML = await getHelpData("footer");
        return div;
    } // getFooterDiv



public async setKeyTables() {
    await this.mergeStdAltKeys();
this.dialog = document.createElement("dialog");
this.dialog.appendChild(await this.getStyleElement());
this.dialog.appendChild(await this.getHeaderDiv());
this.buildTable("general");
const cats = [...this.categoryKeys.keys()].sort();
cats.forEach((s)=>{this.buildTable(s)});
    this.dialog.appendChild(await this.getFooterDiv());

document.body.appendChild(this.dialog);

};  // setKeyTables

private buildTable(category:string) {
    if (! this.categoryKeys.has(category))  return;
const tKeys = this.categoryKeys.get(category)!;
this.categoryKeys.delete(category);
const div = document.createElement("div");
this.dialog?.appendChild(div);
const lbl = document.createElement("label"),
tbl = document.createElement("table");
lbl.innerHTML = category; 
div.append(lbl, tbl);

// table headings..
const thead = document.createElement("thead"),
tbody = document.createElement("body")
tbl.append(thead, tbody);
thead.innerHTML = `
<caption>${category} keys</caption>
<tr>
<th scope="col">Action Description</th>
<th scope="col">Standard Keys</th>
<th scope="col">Alt Keys</th>
</tr>
`;
// Now build table body
tKeys.forEach((k)=>{
    const tr = document.createElement("tr");
    tbody.appendChild(tr);
    tr.innerHTML = `
    <th scope="row">${k.description}</th>
<td>${k.standard  ?? "-"}</td>
<td>${k.alternate ?? "-"}</td>
    `
})






}// buildTable

private addKey( k:KH_Key, helpCategories:Map<string,CategoryKeys>) {
const srch = `${k.category ?? "general"}.${k.desc}`;
let kat:CategoryKeys

    if (!helpCategories.has(srch)) {kat = { category: k.category ?? "general", description: k.desc ?? "" };helpCategories.set(srch , kat); }
     else kat = helpCategories.get(srch)!;
     kat.category = k.category  ?? "general";

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
const dlg = this.dialog;
dlg?.showModal();   
    } //show

} // class lwHelp

