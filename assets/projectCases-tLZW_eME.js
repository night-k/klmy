function n(r=[]){return Array.isArray(r)?r.filter(Boolean).join(`
`):String(r||"").trim()}function i(r=""){const t=String(r||"").trim();return t?/[\r\n]/.test(t)?t.split(/\r?\n/).map(e=>e.trim()).filter(Boolean):t.split(/[,，]/).map(e=>e.trim()).filter(Boolean):[]}export{n as p,i as t};
