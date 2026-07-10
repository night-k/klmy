import{a as p}from"./common-duaSWD5a.js";import{al as o,z as i,A as u,Q as t,I as n,M as _,P as f}from"./vendor-vue-BRHA4Xbc.js";const b={data(){return{code:`{
  "state": {
    "reported": {},
    "desired": {}
  },
  "metadata": {
    "reported": {},
    "desired": {}
  },
  "timestamp": 0,
  "version": 0
}`,activeName:"input"}},methods:{tabClick(d,e){},submit(){},run(){},save(){}}};function v(d,e,x,w,a,V){const r=o("el-button"),s=o("el-tooltip"),l=o("el-row"),c=o("code-editor");return i(),u(f,null,[t(l,null,{default:n(()=>[t(s,{class:"box-item",effect:"dark",content:"当前版本设备无法使用影子",placement:"top-start"},{default:n(()=>[t(r,{disabled:""},{default:n(()=>e[1]||(e[1]=[_("更新影子")])),_:1})]),_:1})]),_:1}),t(l,null,{default:n(()=>[t(c,{ref:"deviceShadow",modelValue:a.code,"onUpdate:modelValue":e[0]||(e[0]=m=>a.code=m),theme:"nord",height:"300px"},null,8,["modelValue"])]),_:1})],64)}const g=p(b,[["render",v]]);export{g as default};
