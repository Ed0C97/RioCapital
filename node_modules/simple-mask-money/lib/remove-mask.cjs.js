"use strict";module.exports=function(e){if("undefined"==typeof document)return()=>{};const n="string"==typeof e?document.querySelector(e):null!=e?e:null;if(null===n)return()=>{};if(!(n instanceof HTMLInputElement))throw new Error("the element must be an input");return()=>{if("removeMask"in n&&"function"==typeof n.removeMask)return n.removeMask()}};
//# sourceMappingURL=remove-mask.cjs.js.map
