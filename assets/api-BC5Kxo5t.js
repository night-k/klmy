import{aE as O,aG as R,c,r as _,j as B,al as r,z as N,A as M,Q as e,I as t,B as n,M as s,O as i,u as V}from"./vendor-vue-BRHA4Xbc.js";import{V as D,Q as J,E as f}from"./vendor-element-igtQnshK.js";import K from"./Header-B-eUwqqE.js";import q from"./CodeEditor-BosWor59.js";import{g as Q}from"./knowledge-CNgO6dnh.js";import{B as G}from"./main-DkV7wB6G.js";import{a as H}from"./common-duaSWD5a.js";import"./vendor-utils--PPHakac.js";import"./oss-BoJn19LU.js";import"./base64-0FQqd29e.js";import"./rag-C4N_g2ke.js";import"./formatter-CcKwBTbH.js";import"./vendor-nf-design-base-elp-VUnWUBuy.js";import"./vendor-highlight-BL21_fQh.js";import"./vendor-echarts-CwNDiq1b.js";import"./vendor-vxe-DxwtHkga.js";const L={class:"knowledge-api"},F={class:"api-info"},W={class:"api-url-container"},X={class:"url-content"},Y={class:"api-url"},Z="/v1/rag/search",ee={__name:"api",setup(te){const z=O(),S=R(),p=z.params.id,j=G,u=c(()=>`${j}${Z}`),$=_({}),A=_([{name:"knowledgeIds",type:"array<long>",required:!0,example:"[1, 2, 3]"},{name:"text",type:"string",required:!0,example:"知识库相关内容"},{name:"maxResults",type:"integer",required:!1,example:"10"},{name:"minSimilarity",type:"number",required:!1,example:"0.7"}]),y=_("curl"),h=c(()=>`curl --request POST \\
  --url "${u.value}" \\
  --header "Authorization: bearer sk-xxxxxxxxxxxxxxxxxxxxxxxx" \\
  --header "Content-Type: application/json" \\
  --data '{
    "knowledgeIds": [${p}],
    "text": "知识库相关内容",
    "maxResults": 10,
    "minSimilarity": 0.7
  }'`),b=c(()=>`const options = {
  method: 'POST',
  headers: {
    'Authorization': 'bearer sk-xxxxxxxxxxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    knowledgeIds: [${p}],
    text: '知识库相关内容',
    maxResults: 10,
    minSimilarity: 0.7
  })
};

fetch('${u.value}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`),T=async()=>{try{const m=await Q(p);$.value=m.data.data}catch{f.error("获取知识库详情失败")}},U=async()=>{try{await navigator.clipboard.writeText(`${u.value}`),f.success("复制成功")}catch{f.error("复制失败")}},C=()=>{S.push(`/knowledge/key/${p}`)};return B(()=>{T()}),(m,l)=>{const d=r("el-tag"),v=r("el-icon"),g=r("el-button"),o=r("el-table-column"),x=r("el-table"),w=r("el-card"),k=r("el-tab-pane"),E=r("el-tabs"),I=r("el-main"),P=r("el-container");return N(),M("div",L,[e(K),e(P,null,{default:t(()=>[e(I,null,{default:t(()=>[e(w,{shadow:"never",class:"card-margin"},{header:t(()=>l[3]||(l[3]=[n("div",{class:"card-header"},[n("div",{class:"header-left"},[n("span",null,"API 调用说明")])],-1)])),default:t(()=>[n("div",F,[e(x,{data:[{url:`${u.value}`,method:"POST",description:"知识库检索接口"}],border:"",style:{width:"100%"}},{default:t(()=>[e(o,{label:"接口地址","min-width":"200"},{default:t(({row:a})=>[n("div",W,[n("div",X,[e(d,{type:"success",size:"small"},{default:t(()=>[s(i(a.method),1)]),_:2},1024),n("code",Y,i(a.url),1),e(g,{type:"primary",link:"",onClick:U},{default:t(()=>[e(v,null,{default:t(()=>[e(V(D))]),_:1}),l[4]||(l[4]=s(" 复制 "))]),_:1}),e(g,{type:"primary",link:"",onClick:C},{default:t(()=>[e(v,null,{default:t(()=>[e(V(J))]),_:1}),l[5]||(l[5]=s(" 密钥 "))]),_:1})])])]),_:1}),e(o,{prop:"description",label:"接口说明",width:"180"})]),_:1},8,["data"]),e(x,{data:[{name:"Authorization",description:"API认证密钥",required:!0,example:"bearer sk-xxxxxxxxxxxxxxxxxxxxxxxx"}],border:"",style:{width:"100%"}},{default:t(()=>[e(o,{prop:"name",label:"请求头名称",width:"180"}),e(o,{prop:"description",label:"说明",width:"180"}),e(o,{prop:"required",label:"是否必填",width:"120"},{default:t(({row:a})=>[e(d,{size:"small",type:a.required?"danger":"info"},{default:t(()=>[s(i(a.required?"是":"否"),1)]),_:2},1032,["type"])]),_:1}),e(o,{prop:"example",label:"示例值","min-width":"200"},{default:t(({row:a})=>[e(d,{size:"small",type:"primary"},{default:t(()=>[s(i(a.example),1)]),_:2},1024)]),_:1})]),_:1}),e(x,{data:A.value,border:"",style:{width:"100%"}},{default:t(()=>[e(o,{prop:"name",label:"字段名",width:"180"}),e(o,{prop:"type",label:"参数类型",width:"180"},{default:t(({row:a})=>[e(d,{size:"small",type:"primary"},{default:t(()=>[s(i(a.type),1)]),_:2},1024)]),_:1}),e(o,{prop:"required",label:"是否必填",width:"120"},{default:t(({row:a})=>[e(d,{size:"small",type:a.required?"danger":"info"},{default:t(()=>[s(i(a.required?"是":"否"),1)]),_:2},1032,["type"])]),_:1}),e(o,{prop:"example",label:"示例值","min-width":"200"},{default:t(({row:a})=>[e(d,{size:"small",type:"primary"},{default:t(()=>[s(i(a.example),1)]),_:2},1024)]),_:1})]),_:1},8,["data"])])]),_:1}),e(w,{shadow:"never"},{header:t(()=>l[6]||(l[6]=[n("div",{class:"card-header"},[n("span",null,"示例代码")],-1)])),default:t(()=>[e(E,{modelValue:y.value,"onUpdate:modelValue":l[2]||(l[2]=a=>y.value=a),class:"demo-tabs"},{default:t(()=>[e(k,{label:"cURL",name:"curl"},{default:t(()=>[e(q,{modelValue:h.value,"onUpdate:modelValue":l[0]||(l[0]=a=>h.value=a),json:!1,readonly:!0,mode:"shell",theme:"nord",height:"250px"},null,8,["modelValue"])]),_:1}),e(k,{label:"JavaScript",name:"javascript"},{default:t(()=>[e(q,{modelValue:b.value,"onUpdate:modelValue":l[1]||(l[1]=a=>b.value=a),json:!1,readonly:!0,theme:"nord",height:"250px"},null,8,["modelValue"])]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})])}}},he=H(ee,[["__scopeId","data-v-4c228bcd"]]);export{he as default};
