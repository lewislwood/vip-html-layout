//  Name: LW Help Data

//
//  Date: May 10, 2024
//
//   Author: Lewis L. Wood
//
//   Description:  Provides some text data.  The purpose is to provide an easy place to find the text to edit and retrieve it. 
//
//  Help Areas  Header Section  is html text
//     Style:  css used for the help dialog
//   Footer:  html for the footer area following the shortcut keys tables.
///   See lw-help.ts for more details
//
type HelpData = "header" | "footer" | "style";

export const getHelpData = async (data: HelpData):Promise<string> =>{
    switch(data) {
        case "header":
            return helpHeader;
            break;
            case "footer":
                return helpFooter;
                break;
                case"style":
                return helpStyle;
break;
    }
return "Invalid data help type..";
};


const helpHeader = `
<div class="help-header">
<h1>Web Page Layout Help Dialog</h1>
<p>
Here is a list of shortcut keys. 
These keys have 2 columns standard variety and alternate variety.
</p>
<p>
The alternative keys are screen reader friendly.
The standard you may need to disable your quick navigation keys.
Jaws users I suggest you suspend your quick navigation keys (insert+shift+z).
To get the full use of all the shortcut keys available.
</p>
</div>
`;

const helpFooter = `
<div class="help-footer">
<b><em>Help system designed & written  by Lewis L Wood</em></b>
</div>
`;

const helpStyle =  `
dialog {
    width: min(600px, 100%);
}
table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  border: 3px solid purple;
}

thead th:nth-child(1) {
  width: 50%;
}

thead th:nth-child(2) {
  width: 70px;
}

thead th:nth-child(3) {
  width: 70px;
}


th,
td {
  padding: 20px;
}
`;
