import "./css/themes.css";
import "./css/main-gen.css";
import "./css/animations.css";
import "./css/lwap.css";
import "./css/3col-ts.css";
import { getLionFace , getQuestionMark} from "./svgs";
import { initKH, KH_Key } from "./lwkh"; 
import { initAP, LwAP } from "./lwap";
import { initTM, ThemeManager } from "./tm";
import {LwHelp} from "./lw-help";

// Comment out both imports for no status management, Only 1 status management to uncomment (1 with demo support and lighter version without demo)
// import { initSM, LwStatus, isStatusDefined } from "./lwStatus";
import { initSM, LwStatusDemo as LwStatus, isStatusDefined } from "./lwStatusDemo";


//  Name: index.ts
//
//   Author: Lewis L. Wood
//
//   Date: May 13, 2024
//
// description: Imports all css and components. and wires up everything.
//
type SM_Override = LwStatus | { [key: string]: Function }

// Uncomment the below lines if you want no status management and you commented out the above 2 import status managment lines
// type SM_Override = { [key: string]: Function }
// const isStatusDefined = false; 

const logIt = (msg: string) => { console.log(msg); };
// defaults to standard to console.log() to start

let sm: SM_Override = {
    quick: logIt, sayIt: logIt, alert: logIt, polite: logIt,
    log: logIt,
}
let statusMessage: HTMLElement = document.getElementById(`lw-status-message`)!;
//@ts-ignore
let tm: ThemeManager, ap: LwAP , kh = initKH();
let help:LwHelp;


// Displays a status message for a specified time in milliseconds, replaces current default or appends.
// Warning if to fast writing to status, prior clear timer will erase it too soon for screen readers
// Use this if you do not want Status manager to handle it or import them
const displayStatus = (msg: string, clrTime: number = 5000) => {
    statusMessage.innerHTML = msg;
    setTimeout(() => { statusMessage.innerHTML = ""; }, clrTime)

}; // displayStatus

const setCopyCode = () => {
    try {
        const copyCode = (e: Event, c: HTMLElement) => {
            const code = c.innerHTML
            navigator.clipboard.writeText(code);
            displayStatus("Code copied to clipboard");
            e.preventDefault();

        };  // copyCode 
        const makeCopyBtn = (code: HTMLElement) => {
            const btn = document.createElement("button")
            btn.setAttribute("alt", "copy code to clpboard");
            btn.innerHTML = "copy";
            btn.setAttribute("class", "code-button")
            btn.onclick = (e) => { copyCode(e, code); };
            return btn;
        }; //  makeCopyBtn 
        const codes = document.querySelectorAll("code");
        codes.forEach((code) => {
            code.after(makeCopyBtn(code));
        }
        );
    } catch (error: any) {
        sm.alert(`setCopyCode error: ${error.message}`);
    }; // catch
}; // setCopyCode

const setUpSM = async () => {
    try {
        // sm.log("Setting up Status Messages...");

        if (! isStatusDefined  ) {
            console.log(`isStatusDefined ${isStatusDefined }`);
            sm.log("No Status Message Handler Installed You may miss it!");
            if (statusMessage) {
                sm.alert = (msg: string) => {
                    displayStatus(msg); console.log(msg);
                };
                sm.quick = (msg: string) => { displayStatus(msg); };
                sm.polite = sm.quick;
                sm.sayIt = sm.quick;
                sm.alert("Only localized statusmessage available.");
                const btn = <HTMLButtonElement>document.getElementById(`sm-demo-button`)!;
                const div = document.getElementById("lw-status-region");
                if (btn) btn.parentNode?.removeChild(btn);
                if (div) div.parentNode?.removeChild(div);




            } else sm.log("No Status area found.  Only console.log available");
        } else {
            //@ts-ignore
            sm = await initSM();
        // sm.log("sm installed...");
            const btn = <HTMLButtonElement>document.getElementById(`sm-demo-button`)!;
            if (sm.supportsDemo) {
                //@ts-ignore
                btn.onclick = () => { sm.demo() };

            // @ts-ignore  
            sm.alert(`button demo: ${btn}`);
        } else {
            btn.parentNode?.removeChild(btn);
    };
            sm.log("LW Status Message Handler Installed");


            setTimeout(() => { sm.quick("LW Status Message Handler Installed") }, 5000);
        }

    }
    catch (err: any) {
        console.log(`Error Loadaing status message: ${err.message} `);
    }
        
    

} // setUpSM 

const enableAPKeys = async () => {

await ap.generateKeys();    
kh.sayIt = (msg:string)=>{sm.alert(msg);};
    ap.enableKeyHandling();
}



const getSVGs = async () => {
    let lion = await getLionFace({ css: ["co-logo-fill", "heart-beat"],ariaLabel:"Lion beating heart animation"})
    let q = await getQuestionMark({ css: ["help-svg"], ariaLabel: "Help alt+shift+?" })
const hb = document.querySelector<HTMLButtonElement>(`#help-btn`);
if (hb) { 
    hb.innerHTML = ""
    hb.appendChild(q);

}

const coLogoContainer = document.querySelector<HTMLDivElement>(`#co-logo-container`);
if (coLogoContainer) {
    const br = coLogoContainer.getBoundingClientRect();
    coLogoContainer.setAttribute("style", `height:${br.width}};`);
    coLogoContainer.appendChild(lion);

};
    const pgLogo = document.querySelector(`.pg-logo-container`);
    if (pgLogo) {
        let lion = await getLionFace({ css: ["co-logo-fill", "heart-beat"], ariaLabel: "Pulsing Face of a Lion" });
        const br = pgLogo.getBoundingClientRect();
        pgLogo.setAttribute("style", `height:${br.width};`);
        pgLogo.appendChild(lion);
    }

}  // getSVGs


const setUpThemeMgr = async ()=>{
    const sq = (m:string)=>{ sm.polite(m);};
    const sl = (m: string) => { sm.log(m); };
    tm = await  initTM( sq, sl);
    const tg = ()=>{ tm.nextTheme();};
    // kh.sayIt = (m:string)=>{ sm.polite(m);};
    
    let kb: KH_Key = kh.newKeyBlank;
    kb = { ... kb, name: "next-theme-alt", desc: "Switch to another theme", altKey:true, shiftKey:true, key:"C", action:tg, category: "general"};
    kh.addKeyTest(kb);

    const tme = <HTMLButtonElement>document.getElementById("tm-editor-btn")!;
tme.addEventListener("click", () => { tm.showEditor() })


    

};  //setUpTheme

const setUpHelp = async ()=>{
    help = new LwHelp();
    const  kb: KH_Key = { ...kh.newKeyBlank, name: "help-alt", desc: "Help Dialog", altKey: true, shiftKey: true, key: "?", action: () => { help.showHelp() } };
    kh.addKeyTest(kb);
    kh.addKeyTest({ ...kb, name: "help", altKey: false });

    setTimeout(() => { help.setKeyTables(); },10000);
    const hb = document.querySelector<HTMLButtonElement>(`#help-btn`);
    if (hb) hb.onclick = ()=>{help.showHelp();};
    

}  //setUpHelp


// General page wireUp
//
const wireUp = async () => {
    setCopyCode();

    const goToMain = () => {
        const h = document.getElementById(`main-heading`)
        if (h) h.focus()

    } // goToMain()
    const b = <HTMLButtonElement>document.getElementById("go2main")

    if (b) b.onclick = () => { goToMain(); };
    await setUpSM();
await setUpThemeMgr ();
ap = await initAP();

getSVGs();

    kh.start();
    ap.sayTime =  (msg:string)=>{ sm.alert(msg);};
    enableAPKeys();
setUpHelp();


} // wireUp()


{

window.addEventListener("DOMContentLoaded", ()=>{ wireUp();});

}
