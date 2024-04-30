"use strict";

import Color  from "color";
import {getContrast} from "accessible-colors";

// This theme Names must equal list of themes in CSS file, order  is presentation order as well. CSS will select the starting poin 
const _themeNames = ["pink", "light", "dark"];
// SUFFIXES BESIDES BG & COLOROnly these suffixes will be swapped per theme.
const _suffixeses = ["canvas", "dlg-bg", "dlg-fg", "img-bg", "svg-pen"]; 
//  Gives nice description  of   colors for editing
type ColorDesc = {[key:string]: {name:string, desc: string}}
const colorDesc:ColorDesc ={
    // pairs are fg or bg, remove the -fg or -bg, no description is needed.
    "gen": {name: "General", desc: ""},
    "dlg": { name: "Dialog", desc: "" },
    // mono colors need description, leave the -fg or -bg if present
    "canvas": { name: "Canvas bg", desc: "Canvas Background color" },
    "img-bg": { name: "Image bg", desc: "Image Background color" },
    "svg-pen": { name: "SVG Pen", desc: "SVG graphics pen" },
}

type RatioWires = {
    sFg: HTMLSelectElement;
    sBg: HTMLSelectElement;
    rL: HTMLLabelElement;
    fn: HTMLDivElement;
    sty: HTMLStyleElement;

}


type ThemeColors = {
    name: string;
    bg:string;
        fg: string;
        [key:string]: string;
}
type Pair = { fg: string, bg: string , html?: string}
type Mono = { color: string, html?: string};
type Color_Lists = {
pairs: Pair[];
monos: Mono[];
};
type ColorOutputMode = "hex" | "rgb" | "hsl";  // Copy to clipboard values



export class ThemeManager {

public     toggleCtrl:HTMLButtonElement;
private     docRoot = <HTMLElement>document.querySelector(":root")!;
    
    current = _themeNames[0];
    themes: {[key: string]:ThemeColors} = {}; 
    private SUFFIXES: string[] = _suffixeses.sort();
    private index = 0;
    private dialog:HTMLDialogElement;
    public sayIt:Function  = console.log;
    public log:Function  = console.log;
    public colorOut: ColorOutputMode= 'hsl' ;
    constructor(
        toggleCtrlOrID = `theme-toggler`) {

        if (typeof toggleCtrlOrID === "string") this.toggleCtrl = <HTMLButtonElement>document.getElementById(toggleCtrlOrID)
        else this.toggleCtrl = toggleCtrlOrID;
        this.initThemes();
        this.toggleCtrl.onclick = () => { this.nextTheme(); };
        this.dialog = this.createDialog();

    }; //constructor

    initThemes() {
        
        try {
            const rs = getComputedStyle(this.docRoot);

            const getColor = (name: string, suffix: string) => {
                const cName = `--${name}-${suffix}`
                return rs.getPropertyValue(cName);
            }; //getColor
            const curBG = getColor("theme", "bg");
            _themeNames.forEach((n: string) => {
                const bg = getColor(n, "bg");
                if (bg === curBG) this.current = n;
                const fg = getColor(n, "fg");
                const nTC:ThemeColors  =  {name:n, bg, fg};
                this.themes[n] = nTC;
                // add the additional suffixes colors
                this.SUFFIXES.forEach((s) => {
                    nTC[s] = getColor(n, s);

                })

            }); // forEach
            this.index = _themeNames.findIndex((t) => { return (t === this.current); });
            this.applyTheme();
            this.setThemeButtonCaption();

        } catch (error:any) {
            this.log(`InitThemes error: ${error.message} `);
        }; //catch
    }; // initThemes

    // ensures that the next theme is a valid them.  Keeps counter from exceeding the maxium
    public nextIndex() {
        let i = this.index + 1;
        if (i >= _themeNames.length) i = 0;
        return i;
    }; // nextIndex

    // Called by toggler button typically, just goes through the list of themes names in order
    public nextTheme() {
        const i = this.nextIndex()
        const name = _themeNames[i];
        this.sayIt(`Switched to ${name}`);

        this.applyTheme(_themeNames[i]);

        this.index = i; this.current = name;
        this.setThemeButtonCaption();


    }; // nextTheme

    // Applies the named theme or reapplies the current theme (current)
    public applyTheme( themeName = this.current) { 
const r = this.docRoot;
        const theme: ThemeColors = this.themes[themeName];
const setColor = (suffix: string, color: string) => {
    const tColor = `--theme-${suffix}`;
    r.style.setProperty(tColor, color);
}; // setColor
setColor("bg", theme.bg);
setColor("fg", theme.fg);
this.SUFFIXES.forEach((s) => {
    setColor(s, theme[s]);
});

    } // applyTheme

    // updates the toggle button caption and calls sayIt to speak it
    setThemeButtonCaption() {
        const nextTheme = _themeNames[this.nextIndex()];
setTimeout(() => {
        const caption = `Switch to ${nextTheme} theme`
        this.toggleCtrl.innerText = `${nextTheme}`;
        this.toggleCtrl.setAttribute("alt", caption)
    },200);
            ;
    }; // setThemeButtonCaption

    // Builds list of colors in categories of paired and mono/non-paired
    private async buildColorsHTML() {

        let cl:Color_Lists = {
             pairs: [ {fg:"fg", bg: "bg"}],
            monos: []
        } ;
        const colorsHTML: string[] = [];
        const colors = new Map<string, string>(), isPair= /[fb]g$/, isFG = /fg$/;
        this.SUFFIXES.forEach((c) => {
if ( ! isPair.test(c)) cl.monos.push({color:c})
else {
    const p:Pair = { fg: "", bg: ""};
    let searchValue = "";
    if (isFG.test( c)) {
        searchValue = c.replace(/[fb]g/i, "bg").toLowerCase();
        p.fg = c;p.bg = searchValue;
    }
    else {
        searchValue = c.replace(/[fb]g/i, "fg").toLowerCase();
        p.bg = c; p.fg = searchValue;
    } 
    if (colors.has(searchValue)) {
        // Valid pair found now add the pair and remove the suffix from the colors map object
        cl.pairs.push(p);
        colors.delete(searchValue);
    }    else {
        colors.set(c.toLowerCase(),searchValue );
    }
}
        });  // suffixes forEach
        // Whatever left will be treated as a mono color
        const left = [...colors.keys()];
        left.forEach((c)=> { cl.monos.push({color:c.toLowerCase()});});
// Now generate HTML for each color
const pairHTML = (p:Pair) => {
    let cd;
    if (p.fg === "fg")cd  = {name:"General"}
    else cd  = colorDesc[p.fg] ?? colorDesc[p.fg.replace(/-[fb]g/i, "")] ?? {name: "unknown", desc: ""};
    const fn:string = cd.name;
    p.html = `
    <span class="tm-color-pair">
<label class="tm-color-label" >${fn} fg:bg&nbsp;</label>
<input name="${p.fg}"   type="color" class="tm-inp-color" value="#000000" aria-label="${fn} foreground color"  >
&nbsp;
<input name="${p.bg}"  type="color" class="tm-inp-color" value="#000080"  aria-label="${fn} background color">
<input type="text" class="tm-ratio-input" readonly="true" alt="contrast ratio" maxlength="5"    value="0.00"  >
<br/>
    </span>
    `;
    return p.html;
        } // pairHTML 
cl.pairs.forEach((p) =>{ colorsHTML.push(pairHTML(p))});
const monoHTML = (m:Mono) => {
    try {
const cd = colorDesc[m.color.toLowerCase()] ?? {name:m.color, desc:m.color};
    m.html = `
    <span class="tm-color-mono">
                <label class="tm-mono-label">${cd.desc}</label>
<input class="tm-mono-input" name="${m.color}"   type="color" class="tm-inp-color" value="#000000" aria-label="${cd.desc}"  >
                </span>
    `;
    return m.html;

} catch(err: any) {
    this.log(`Mono HTml  ${err.message}`);
    return "<p>ERRROR MONO CoLOr</p>";
} // catch
} // monoHtml
cl.monos.forEach((m)=> {colorsHTML.push(monoHTML(m))});
return colorsHTML;
    }// buildColorsHTML

    //     // Creates the dialog generic without colors controls.  They will be dynamically swapped in when needed.
    private createDialog():HTMLDialogElement {
const dlg = document.createElement("dialog");
        dlg.setAttribute("id", "tm-edit-dialog");
        dlg.classList.add( "tm-edit-dialog");
        dlg.setAttribute("aria-hidden", "false");
        this.dialog = dlg;
        return dlg;
    } // createDialog
    

private async buildHTML() {
 
    const dlg = this.dialog;
    const hdr = `
                <div class="tm-dlg-hdr">

                <h5>Theme  Editor Dialog</h5>

                <p>
                   Here you can review and edit the current theme colors. Once you like your color settings simply select the copy to clipboard and paste it into an email  for your developer.  
                </p>
                <p>                   
                    Once the developer receives this email.  It is a simple matter to incorporate the edited color scheme as a new or revised one.
                    *** Warning the edited color theme is not saved anywhere, thus after you reload the browser the edited version of the theme will no longer be present.  This also an easy way to abort/abandon the color scheme. ((f5) will reload the browser).
                <P>
                <p>
                Note the contrast ratio ratio number following a paired color. This indicates the color ratio value set by the w3c ADA complicance.  3.51 or higher is "AA" rating and good for large fonts. 7.5 or more is AAAA for normal size fonts.  Click on ratio button to do a more detail comparisons and explanations.
                </P>
            </div>
    `;

    const colorControls: string[] = await this.buildColorsHTML();
    const body = `
                <div class="tm-dlg-body">
                <div class="tm-color-container">

                <span class="tm-dlg-top-line">
                    <label for="tm-theme-name">Youre editing theme: &nbsp;</label> <input id="tm-theme-name"  type="text" name="theme"value="dark"  readonly>
                                    </span>
                                    ${colorControls.join("\n")}
<!-- tm-color-container -->
                </div>
                <!-- tm-dlg-body -->
            </div>
    ` ;
const ftr = `
<div class="tm-dlg-grid-line">

            <div class="tm-dlg-ftr">
                    <button id="tm-apply-btn"  alt="Apply colors to the theme" >Apply</button>
                    <button id="tm-copy-btn" alt="Copy theme colors to clipboard to paste elesewhere" >Copy</button>
                    <button id="tm-ratio-btn" alt="Calculate ADA Color Ratios" >Ratios</button>
                    <button type="dialog" id="tm-dlg-close-btn" alt="Close Theme Editor ">Close</button>
            </div>
            </div>
`;
const frm = `
                <form id="tm-form" name="theme-editor"  method="dialog" >
${body}
${ftr}
                </form>
` ;

dlg.innerHTML = `
${hdr}
${frm}
`;
document.body.appendChild(dlg);
await this.wireUpHTML();
} // buildHTML


private async wireUpHTML() {
    const dlg = this.dialog;

    const  pairsChanged  = ( iFg:HTMLInputElement, iBg:HTMLInputElement, r:HTMLInputElement)=>{
        const ratio = Math.floor((getContrast(iBg.value, iFg.value) ?? 0) * 100)/100;
        r.value = ratio.toString();
    } // pairsChanged
    const pairs = dlg.querySelectorAll(".tm-color-pair")!;
pairs.forEach((p) => {
    const inputs = p.querySelectorAll("input") ;
    const iFg:HTMLInputElement = inputs[0], iBg:HTMLInputElement = inputs[1];
    const r =p.querySelector<HTMLInputElement>(".tm-ratio-input")!; 
    
    iFg.onchange =  ()=>{ pairsChanged(iFg,iBg, r)};
    iBg.onchange = () => { pairsChanged( iFg, iBg, r) };
 }) // color pairs forEach

 //Mono colors
//  const monoChanged = (sw:HTMLDivElement, inp:HTMLInputElement)=>{
//     sw.setAttribute("style", `background:${inp.value};`)
//     sw.setAttribute("alt", `${inp.name} color is ${inp.value}`);
//  }
// const    monos = dlg.querySelectorAll<HTMLSpanElement>(".tm-color-mono")!; 
// monos.forEach((m)=>{
//     const sw: HTMLDivElement = m.querySelector(".tm-color-swatch")!;
//     const inp:HTMLInputElement = m.querySelector("input")!;
//     inp.onchange = ()=>{monoChanged(sw,inp)};
// }) // monos.forEach

    const apply:HTMLButtonElement = dlg.querySelector("#tm-apply-btn")!;
    apply.onclick = (e:Event) =>{ this.applyEdits(e, apply)} ;
    const copy: HTMLButtonElement = dlg.querySelector("#tm-copy-btn")!;
    copy.onclick = (e: Event) => { this.copyEdits(e, copy) };
    const ratio: HTMLButtonElement = dlg.querySelector("#tm-ratio-btn")!;
    ratio.onclick = (e: Event) => { this.ratioDialog(e, ratio) };


    const cls: HTMLButtonElement = dlg.querySelector("#tm-dlg-close-btn")!;
    cls.onclick = ()=>{ this.closeEditor();};

} // wireUpHTML
private async applyEdits(e: Event, btn: HTMLButtonElement) {
    e.preventDefault()
    const form:HTMLFormElement = btn.form!;
    const fd = new FormData(form);
    const name: string  = fd.get("theme")?.toString()!; 
    fd.delete("theme");
    const th = this.themes[name];
    // const colors: string[] = [];
for (let [key, value] of fd.entries()) {
    const color = `${(key != "fg")? key: "color"}`;
    th[color] = value.toString();
    //  colors.push(color);
}
this.applyTheme(name);
this.sayIt(`${name} theme changes applied.`);;
} //applyEdits

// Converts any color to the string in desired format;
public colorToString( colorValue: string, colorType:ColorOutputMode = this.colorOut): string {
const tc = Color(colorValue);
return ((colorType  === "hex")? tc.hex(): (colorType === "hsl")? tc.hsl(): tc.rgb() ) as string;
} ; // colorToString

// Copy the theme edited values to the clipboard
private async copyEdits(e:Event, btn:HTMLButtonElement) {
    e.preventDefault();
    const form: HTMLFormElement = btn.form!;
    const fd = new FormData(form);
    const themeName = fd.get("theme");
    fd.delete("theme");
    
const out: string[] = [`/* Colors for theme ${themeName} -> simply email them to the developer and they will  incorporate these values for you */`];
    for (let [key, value] of fd.entries()) {
out.push(` --${themeName}-${key}: ${this.colorToString(value as string )};`);
    }
    out.push(`/* End of ${themeName} values */`);
window.navigator.clipboard.writeText(out.join("\n"));
this.sayIt(`${themeName} theme values copied to clipboard.`);
} // copyEdits

public async showEditor() {
    const dlg = this.dialog;
    if (dlg.innerHTML === "")await  this.buildHTML();
    document.body.appendChild( dlg);;
await this.hydrateEditor();
dlg.setAttribute("aria-hidden", "false")
// dlg.classList.remove("hidden");
dlg.open == true;
    dlg.show();
} // showDialog





// Pulls the theme and values into the dialog
private async hydrateEditor(themeName = this.current) {
const th = this.themes[themeName];
const form:HTMLFormElement   = this.dialog.querySelector("form")!;
const fd = new FormData(form);
fd.delete("theme");
const iTh= form.querySelector<HTMLInputElement>(`[name="theme"]`)!;
iTh.value = themeName;
for (let key of fd.keys()) {
    try {
    const inp = form.querySelector<HTMLInputElement>(`[name="${key}"]`);
    if (inp) {
        const color = Color( th[key]);
        
        const v = color.hex();
        inp.value = v; inp.value = v;
    // this.log(`Hydrating-> ${key}  = ${v  }`);
if ( inp.   onchange) inp.onchange( new MouseEvent("change") );
    } else this.log(`Field not found: ${key}`);

} catch(err:any) {
    this.log( `Hydrate Colors: ${err.message}`);
};  //catch
} // for key of fd

} /// hydrateEditor

public async closeEditor() {
    const dlg = this.dialog;
    // dlg.setAttribute("aria-hidden", "true");
    await dlg.close();
    dlg.open = false;
    dlg.parentNode?.removeChild(dlg);
    // dlg.classList.add("hidden");

    const rd = document.querySelector<HTMLDialogElement>("#ratio-dialog");
    if (rd) this.ratioClose(rd);
}; /// closeEditor

    // Display ADA Color ratios dialog
    private async ratioDialog(e: Event, btn: HTMLButtonElement) {
        e.preventDefault();
        const form: HTMLFormElement = btn.form!;
        const fd = new FormData(form);
        const themeName = fd.get("theme") as string;
        fd.delete("theme");

        const colors = new Map<string, string>();
        for (let [key, value] of fd.entries()) {
            let name = key;
            if ((key === "fg") || (key === "bg")) name = "gen-" + key; 
            colors.set( name, value as string);
        }

        const dlg = await this.buildRatioDialog(themeName, colors);
        document.body.appendChild(dlg);
        dlg.showModal();

    } // ratioDialog

    private async buildRatioDialog(themeName: string, colors: Map<string, string>):Promise<HTMLDialogElement>{
        const dlg = document.createElement("dialog");
        dlg.id = "ratio-dialog";
const style = document.createElement("style");
        style.innerHTML = `
        #ratio-dialog { background:${colors.get("gen-bg")};color:${colors.get("gen-fg")};
        display: block; 
        width: 500px;
        padding 8px;
    }
        .ratio-hdr {
            display: block; width 100%;
            margin: 5px; padding 3px;
        }
                        .svg-sz {
                    display: block;
                    width: 200px;
                    height: 200px;
                }
                span {
                    display: inline-block;
                    width: 100%;
                               }
                               .demoWide {
                                display: block;
                                width: 100%;
                               }
                               .large {
                                font-size: 14pt;
                               }
                               .normal {
                                font-size: 9pt;
                               }
.svg-container {
            display: grid;
            width: 100%;
         justify-items: center;
        }
                               
        `;
        const hdr = document.createElement("div");
        hdr.classList.add("ratio-hder");
        hdr.innerHTML = `
        <h1>ADA Color Contrast Ratio Analyzer for Theme: ${themeName}</h1>
        <p>
        This is the color contrast ratio analyzer. This will help you determine if your choosen color schemes are good for all peoples, including visually impaired.
        </p><p>
A tripple "a" rating / "AAA" is what is considered very good contrast and visible for most visually impaired ar a normal font ratio. The ratio is 3.51 or or higher.
        </p><p>
A double "AA" rating is 7.0 lower.
        </p>
        `;
dlg.append(style, hdr);
const span = document.createElement("span");
const fL = document.createElement("label"),
sFg  = document.createElement("select");
        const bL = document.createElement("label"),
            sBg = document.createElement("select");
            fL.innerHTML = "Foreground"; fL.id = "tm-id-ratio-fl";
        bL.innerHTML = "BackGround"; bL.id = "tm-id-ratio-bl";
        sFg.setAttribute("aria-labeledby", "tm-id-ratio-fl"); sBg.setAttribute("aria-labeledby", "tm-id-ratio-bl")
        const rL = document.createElement("label");
        rL.setAttribute("tabindex", "0");
        rL.innerHTML = "Ratio is 12.415" ;
span.append(fL, sFg, bL, sBg, rL);
const sorted = [...colors.keys()].sort(), options: string[] = [];
sorted.forEach((c,i)=>{
const v = colors.get(c) ;
options.push(`<option ${(i===0)?"selected":""} value="${v}" >${c}></option> `);
}); // forEach sorted
sFg.innerHTML = options.join("");sBg.innerHTML = options.join("");
        
        const fn = document.createElement("div");
        fn.classList.add("demoWide");
        fn.innerHTML = `
        <p class="large">
        This is the large font area. This requires a rating of 3.51 or greater. That is a "AA" rating.
        </p>
        <p class="normal">
This is the normal font area and requires a "AAA" or Ratio score of 7.5 or higher in order to W3C ADA compliant.
        </p>
        `

const divg = document.createElement("div");
        divg.classList.add("svg-container")
divg.innerHTML = `
<svg  name="blind-man"  class="svg-sz" role="img" aria-label="blind man"    version="1.1" id="svg2"
    width="800px" height="800px" viewBox="0 0 1200 1200" enable-background="new 0 0 1200 1200" xml:space="preserve">
    <sodipodi:namedview inkscape:cy="448" inkscape:cx="-67.796606" inkscape:zoom="0.26339286" showgrid="false"
        id="namedview3172" guidetolerance="10" gridtolerance="10" objecttolerance="10" borderopacity="1"
        bordercolor="#0000a0"  pagecolor="none" inkscape:current-layer="svg2" inkscape:window-maximized="1"
        inkscape:window-y="24" inkscape:window-height="876" inkscape:window-width="1535" inkscape:pageshadow="2"
        inkscape:pageopacity="0" inkscape:window-x="65">
    </sodipodi:namedview>
    <path class="svg-f"    id="path4006" inkscape:connector-curvature="0" d="M385.312,0c-65.813,0-119.166,53.352-119.166,119.166
	c0,65.813,53.353,119.166,119.166,119.166c65.814,0,119.167-53.353,119.167-119.166C504.479,53.352,451.126,0,385.312,0z
	 M286.286,299.713L158.228,472.611c-5.122,6.829-7.676,14.053-7.676,21.736L135.2,636.503c-6.928,62.019,81.763,76.349,92.188,8.968
	l12.806-131.897l33.288-44.802l1.292,185.666l-62.737,225.338L51.982,1083.379c-46.537,72.435,49.647,126.372,98.572,69.158
	L317.03,938.676c4.471-6.019,7.239-14.069,10.222-21.736l49.97-176.736L489.892,866.97l61.445,286.87
	c16.961,76.578,134.751,50.207,120.382-23.065L606.446,832.42c-1.555-7.685-3.242-16.207-10.222-21.774L457.943,653.137V516.109
	v-57.608l53.77,67.867c5.976,7.683,14.953,13.229,26.903,16.644l126.767,24.32l469.914,618.482
	c8.392,11.667,32.137,0.041,23.065-15.353L720.44,568.598c51.496-17.263,23.699-75.92-10.26-81.964l-135.733-26.866L434.874,284.322
	c-44.207-43.902-118.137-33.112-148.54,15.352L286.286,299.713z" />
</svg>
`

const sty  = document.createElement("style");
        sty.innerHTML = `.svg-f { fill: white; }`;

        fn.append( sty, divg);
        const cls = document.createElement("button");
        cls.type = "reset";cls.innerHTML = "Close";
        cls.setAttribute("alt", "Close Color Ratio Analyzer");

const frm = document.createElement("form");
frm.method = "dialog";
frm.append(span,fn, cls);
dlg.appendChild(frm);

        const rChange = () => { this.ratioADAWiring({ sFg, sBg, rL , fn, sty}); }
        sFg.onchange = (e: Event) => { e.preventDefault(); rChange(); };
        sBg.onchange = (e: Event) => { e.preventDefault(); rChange(); }; 
        cls.onclick = (e:MouseEvent)=>{ e.preventDefault(); this.ratioClose(dlg);};


        return dlg;
    }; // buildRatioDialog


    private async ratioADAWiring({ sFg, sBg, rL, fn, sty }:RatioWires) {
rL.innerHTML = `Contrast ratio is ${getContrast(sFg.value, sBg.value)}`;
fn.setAttribute("style", `background: ${sBg.value};color:${sFg.value};`)
sty.innerHTML = `.svg-f { fill: ${sFg.value};}`
        }; // ratioADAWiring

        private async ratioClose(dlg:HTMLDialogElement) {
            dlg.close();
            dlg.parentNode?.removeChild(dlg);
        }

}; // class ThemeManager


let themeMgr:ThemeManager;
export const 
initTM = async (sayIt: Function, log: Function, themeToggler = "theme-toggler") =>{
    if (themeMgr) return themeMgr; 
    themeMgr = new ThemeManager( themeToggler  );
    themeMgr .sayIt = sayIt;
    themeMgr.log = log;
    return themeMgr;
}
