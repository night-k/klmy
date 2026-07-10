import{productQRCodePrinting as x}from"./workOrder-BMHMNvZf.js";import{s as w}from"./savePrintRecord-r5IlYqOZ.js";import{al as c,z as s,H as f,I as d,B as e,Q as h,M as y,A as m,P as _,a4 as v,O as b,J as k,R as D}from"./vendor-vue-BRHA4Xbc.js";import{a as B}from"./common-duaSWD5a.js";import"./main-DkV7wB6G.js";import"./base64-0FQqd29e.js";import"./vendor-element-igtQnshK.js";import"./vendor-utils--PPHakac.js";import"./vendor-nf-design-base-elp-VUnWUBuy.js";import"./vendor-highlight-BL21_fQh.js";import"./vendor-echarts-CwNDiq1b.js";import"./vendor-vxe-DxwtHkga.js";import"./printLog-CjKnm5ZI.js";const C={mixins:[w],props:{visible:{type:Boolean,default:!1},rowId:{type:String,default:null}},emits:["update:visible"],data(){return{show:!1,qrcodeData:[]}},watch:{visible(){this.show=this.visible,this.show&&this.initData()},show(){this.$emit("update:visible",this.show)}},methods:{initData(){x(this.rowId).then(i=>{const t=i.data.data;this.qrcodeData=t})},packingQRcode(){setTimeout(()=>{const i=document.getElementById("qrcord").innerHTML;this.packing(i,"landscape")},200)},async packing(i,t="portrait"){let a=document.getElementById("printIframe");a.contentWindow.document.body.innerHTML="";let l=a.contentWindow.document;const o=`
        <style media="print">
          @page {size: ${t};margin: 15mm;}
          body {margin: 0; padding: 0; font-family: Arial, sans-serif;}
          #print-content {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            padding: 0;
            max-width: 100%;
          }
          #print-content > div {
            width: calc(50% - 10px);
            display: flex;
            flex-direction: column;
            align-items: center;
            break-inside: avoid;
          }
          #print-content > div:nth-child(4n+1) {
            break-before: page;
          }
          #print-content > div > div {
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
          }
          #print-content img {
            width: 100px;
            height: 100px;
          }
          #print-content > div > div > div {
            display: flex;
            align-items: center;
            font-weight: 700;
            margin-top: 10px;
            width: 100%;
            justify-content: center;
          }
          #print-content p {
            margin: 0;
            margin-right: 10px;
          }
          #print-content p:last-child {
            margin-right: 0;
          }
        </style>
        <style media="print">@page {size: ${t};margin: 0mm;padding: 20px}td{border: 1px solid #333;}</style>
      `+'<div id="print-content">'+i+"</div>";l.write(o),l.close(),a.contentWindow.focus(),setTimeout(function(){a.contentWindow.print()},50);const p={printBizType:"customPrint-workOrderQrcode",printType:t,printData:JSON.stringify(o)};this.handleSavePrintLog(p)},closeDialog(){this.qrcodeData=[],this.show=!1}}},I={key:0,id:"qrcord",style:{display:"flex","flex-wrap":"wrap",gap:"20px",padding:"20px","max-height":"65vh","overflow-y":"auto"}},q={style:{display:"flex","justify-content":"center","flex-direction":"column","align-items":"center",padding:"20px",width:"100%","box-sizing":"border-box"}},S=["src"],T={style:{display:"flex","align-items":"center","font-weight":"700","margin-top":"10px",width:"100%","justify-content":"center"}},P={style:{margin:"0"}},Q={class:"dialog-footer"},R={id:"printIframe"};function V(i,t,a,l,n,o){const p=c("el-empty"),g=c("el-button"),u=c("el-dialog");return s(),f(u,{modelValue:n.show,"onUpdate:modelValue":t[0]||(t[0]=r=>n.show=r),title:"产品二维码打印",width:"50%","append-to-body":!0,"close-on-click-modal":!1,onClose:o.closeDialog},{footer:d(()=>[e("span",Q,[h(g,{type:"primary",onClick:o.packingQRcode},{default:d(()=>t[2]||(t[2]=[y("打印")])),_:1},8,["onClick"]),h(g,{onClick:o.closeDialog},{default:d(()=>t[3]||(t[3]=[y("取 消")])),_:1},8,["onClick"])])]),default:d(()=>[n.qrcodeData&&n.qrcodeData.length>0?(s(),m("div",I,[(s(!0),m(_,null,v(n.qrcodeData,r=>(s(),m("div",{key:r.barcode,style:{width:"calc(50% - 10px)",display:"flex","flex-direction":"column","align-items":"center"}},[e("div",q,[e("img",{src:"data:image/png;base64,"+r.path,alt:"",style:{width:"100px",height:"100px"}},null,8,S),e("div",T,[t[1]||(t[1]=e("p",{style:{margin:"0","margin-right":"10px"}},"出厂编号:",-1)),e("p",P,b(r.barcode),1)])])]))),128))])):(s(),f(p,{key:1,description:"暂无数据","image-size":"40"})),k(e("iframe",R,null,512),[[D,!1]])]),_:1},8,["modelValue","onClose"])}const G=B(C,[["render",V],["__scopeId","data-v-c0fbb3d3"]]);export{G as default};
