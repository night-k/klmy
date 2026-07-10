import{V as m,w as p,E as n}from"./vendor-element-igtQnshK.js";import h from"./HiLight-Ghmixb8H.js";import{f}from"./flow-C3uwVg-6.js";import{a as g}from"./common-duaSWD5a.js";import{al as d,z as y,H as b,I as v,B as e,D as r,O as w,Q as C}from"./vendor-vue-BRHA4Xbc.js";import"./vendor-utils--PPHakac.js";import"./vendor-highlight-BL21_fQh.js";import"./formatter-CcKwBTbH.js";import"./main-DkV7wB6G.js";import"./base64-0FQqd29e.js";import"./vendor-nf-design-base-elp-VUnWUBuy.js";import"./vendor-echarts-CwNDiq1b.js";import"./vendor-vxe-DxwtHkga.js";const _={name:"EmbedConfig",inject:["parent"],components:{DocumentCopy:m,Close:p,HiLight:h},props:{type:{type:String,default:"chat"},modelValue:{type:Boolean,default:!1}},emits:["update:modelValue"],data(){return{dialogVisible:this.modelValue,currentLayout:"iframe-full",config:{width:"100%",height:"100%",minHeight:"700px",frameborder:"0",allow:"microphone",token:this.parent.id},baseUrl:""}},created(){this.baseUrl=`${window.location.protocol}//${window.location.host}`},computed:{chatUrl(){return`${this.baseUrl}${f.runUrl(this.type,this.config.token)}`},jsUrl(){return`${this.baseUrl}/embed.min.js`},codeTitle(){return this.currentLayout==="js-button"?"将以下代码添加到你的网页 </head> 标签前":this.currentLayout==="iframe-float"?"复制以下网址分享给其他人":"将以下 iframe 嵌入到你的网站中的目标位置"},generatedCode(){if(this.currentLayout==="js-button")return`<!-- 添加到 </head> 标签前 -->
<script>
  window.chatbotConfig = {
    token: '${this.config.token}',
    type: '${this.type}'
  }
<\/script>
<script
  src="${this.jsUrl}"
  defer>
<\/script>
<style>
  #avue-chatbot-bubble-button {
    background-color: #1C64F2 !important;
  }
  #avue-chatbot-bubble-window {
    width: 800px !important;
    height: 600px !important;
  }
</style>`;if(this.currentLayout==="iframe-float")return this.chatUrl;const o={"iframe-full":{width:"100%",height:"100%",minHeight:"700px"}},t=o[this.currentLayout]||o["iframe-full"],a=`width: ${t.width}; height: ${t.height}; min-height: ${t.minHeight}`;return`<iframe
  src="${this.chatUrl}"
  style="${a}"
  frameborder="${this.config.frameborder}"
  allow="${this.config.allow}">
</iframe>`}},watch:{modelValue(o){this.dialogVisible=o},dialogVisible(o){this.$emit("update:modelValue",o)}},methods:{selectLayout(o){this.currentLayout=o,o==="iframe-float"&&this.copyCode()},async copyCode(){try{await navigator.clipboard.writeText(this.generatedCode),n.success("代码已复制到剪贴板")}catch{n.error("复制失败，请手动复制")}},handleClose(){this.dialogVisible=!1}}},$={class:"embed-container"},L={class:"layout-selector"},V={class:"layout-options"},k={class:"layout-preview"},U=["src"],x={class:"layout-preview"},j=["src"],H={class:"layout-preview"},B=["src"],E={class:"code-section"},D={class:"code-header"},T={class:"code-title"},z={class:"code-content"};function I(o,t,a,N,s,i){const c=d("HiLight"),u=d("el-dialog");return y(),b(u,{modelValue:s.dialogVisible,"onUpdate:modelValue":t[3]||(t[3]=l=>s.dialogVisible=l),title:"嵌入到网站中",width:"800px",class:"embed-dialog",onClose:i.handleClose},{default:v(()=>[e("div",$,[t[10]||(t[10]=e("div",{class:"embed-header"},[e("p",{class:"header-desc"},"选择一种方式将聊天应用嵌入到你的网站中")],-1)),e("div",L,[e("div",V,[e("div",{class:r(["layout-option",{active:s.currentLayout==="iframe-full"}]),onClick:t[0]||(t[0]=l=>i.selectLayout("iframe-full"))},[e("div",k,[e("img",{src:`${o.$router.options.base}img/chat/iframe.svg`,class:"preview-icon",alt:"全屏布局"},null,8,U),t[4]||(t[4]=e("span",{class:"preview-text"},"iframe布局",-1))]),t[5]||(t[5]=e("div",{class:"layout-dot"},null,-1))],2),e("div",{class:r(["layout-option",{active:s.currentLayout==="iframe-float"}]),onClick:t[1]||(t[1]=l=>i.selectLayout("iframe-float"))},[e("div",x,[e("img",{src:`${o.$router.options.base}img/chat/link.svg`,class:"preview-icon",alt:"网站打开"},null,8,j),t[6]||(t[6]=e("span",{class:"preview-text"},"网站打开",-1))]),t[7]||(t[7]=e("div",{class:"layout-dot"},null,-1))],2),e("div",{class:r(["layout-option",{active:s.currentLayout==="js-button"}]),onClick:t[2]||(t[2]=l=>i.selectLayout("js-button"))},[e("div",H,[e("img",{src:`${o.$router.options.base}img/chat/script.svg`,class:"preview-icon",alt:"按钮布局"},null,8,B),t[8]||(t[8]=e("span",{class:"preview-text"},"按钮布局",-1))]),t[9]||(t[9]=e("div",{class:"layout-dot"},null,-1))],2)])]),e("div",E,[e("div",D,[e("span",T,w(i.codeTitle),1)]),e("div",z,[C(c,{code:i.generatedCode,language:"html"},null,8,["code"])])])])]),_:1},8,["modelValue","onClose"])}const X=g(_,[["render",I],["__scopeId","data-v-b097a73a"]]);export{X as default};
