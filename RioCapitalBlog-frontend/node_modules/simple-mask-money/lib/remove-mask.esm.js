function e(e){if("undefined"==typeof document)return()=>{};const n="string"==typeof e?document.querySelector(e):null!=e?e:null;if(null===n)return()=>{};if(!(n instanceof HTMLInputElement))throw new Error("the element must be an input");return()=>{if("removeMask"in n&&"function"==typeof n.removeMask)return n.removeMask()}}export{e as default};
//# sourceMappingURL=remove-mask.esm.js.map
