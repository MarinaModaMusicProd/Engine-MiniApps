import{bH as q,j as e,aw as M,O as R,aY as U,r as d,Y as O,T as n,N as Q,ay as W,cJ as J,aC as b,u as I,J as m,a8 as p,_ as K,c1 as Z,m as y,d as T,A as E,b5 as C,c$ as V,d0 as X,q as S,W as _,b6 as v,a9 as D,U as h,t as ee,Z as se,a0 as ae,a1 as ne,aB as te,aa as N,a7 as Y,a5 as ie,b as le,d1 as re,d2 as ce,d3 as g}from"./main-b33c18f4.js";import{B as w,a as o,u as de,b as oe,S as me,O as xe}from"./OpenInNew-dc34a5fe.js";import{S as ue,l as je,B as ge}from"./billing-redirect-message-787bc4b2.js";import{C as he}from"./CalendarToday-13233900.js";import{E as A}from"./Edit-d3366b5f.js";import"./MoreHoriz-9a2d1a07.js";import"./TaskAlt-10d91cd4.js";function pe({children:s}){const{isSubscribed:t}=q();return t?s||e.jsx(R,{}):e.jsx(M,{to:"/pricing",replace:!0})}function fe(){const{user:s}=q(),t=U(s.id,{with:["subscriptions.product","subscriptions.price"]});return e.jsxs(d.Fragment,{children:[e.jsx(O,{children:e.jsx(n,{message:"Billing"})}),e.jsx(Q,{menuPosition:"billing-page"}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("div",{className:"container mx-auto my-24 px-24 flex-auto",children:t.isLoading?e.jsx(W,{className:"my-80","aria-label":"Loading user..",isIndeterminate:!0}):e.jsx(R,{})}),e.jsx(J,{className:"container mx-auto px-24"})]})]})}const be="/billing";function ye(){const s=b();return e.jsxs(d.Fragment,{children:[e.jsxs(w,{children:[e.jsx(o,{isLink:!0,onSelected:()=>s(be),children:e.jsx(n,{message:"Billing"})}),e.jsx(o,{children:e.jsx(n,{message:"Payment method"})})]}),e.jsx("h1",{className:"text-3xl font-bold my-32 md:my-64",children:e.jsx(n,{message:"Change payment method"})}),e.jsx(R,{})]})}const ve="/billing";function Ne(){const{base_url:s}=I();return e.jsxs("div",{className:"max-w-[464px]",children:[e.jsx(ue,{type:"setupIntent",submitLabel:e.jsx(n,{message:"Change"}),returnUrl:`${s}/billing/change-payment-method/done`}),e.jsx(m,{variant:"outline",className:"w-full mt-16",size:"md",to:ve,elementType:p,type:"button",children:e.jsx(n,{message:"Go back"})})]})}function x(){var a,i,l;const s=U("me",{with:["subscriptions.product","subscriptions.price"]});return{subscription:(i=(a=s.data)==null?void 0:a.user.subscriptions)==null?void 0:i[0],isLoading:s.isLoading,user:(l=s.data)==null?void 0:l.user}}function k(){K.invalidateQueries({queryKey:["users"]})}const G="/billing";function we(){const{billing:{stripe_public_key:s}}=I(),t=b(),[a]=Z(),i=a.get("setup_intent_client_secret"),[l,r]=d.useState(),c=d.useRef();return d.useEffect(()=>{c.current||!i||(je(s).then(u=>{if(!u){r($());return}u.retrieveSetupIntent(i).then(({setupIntent:j})=>{(j==null?void 0:j.status)==="succeeded"&&Pe(j.payment_method).then(()=>{k()}),r($(j==null?void 0:j.status))})}),c.current=!0)},[s,i]),i?e.jsx(ge,{config:l}):(t(G),null)}function $(s){switch(s){case"succeeded":return{...P,message:y("Payment method changed successfully!"),status:"success"};case"processing":return{...P,message:y("Your request is processing. We'll update you when your payment method is confirmed."),status:"success"};case"requires_payment_method":return{...P,message:y("Payment method confirmation failed. Please try another payment method."),status:"error"};default:return{...P,message:y("Something went wrong"),status:"error"}}}const P={link:G,buttonLabel:y("Go back")};function Pe(s){return T.post("billing/stripe/change-default-payment-method",{payment_method_id:s})}function f({title:s,children:t}){return e.jsxs("div",{className:"mb-64",children:[e.jsx("div",{className:"text-sm font-medium uppercase pb-16 mb-16 border-b",children:s}),t]})}function Ce(){const s=b();return e.jsxs(d.Fragment,{children:[e.jsxs(w,{children:[e.jsx(o,{isLink:!0,onSelected:()=>s("/billing"),children:e.jsx(n,{message:"Billing"})}),e.jsx(o,{children:e.jsx(n,{message:"Plans"})})]}),e.jsx("h1",{className:"my-32 text-3xl font-bold md:my-64",children:e.jsx(n,{message:"Change your plan"})}),e.jsx(f,{title:e.jsx(n,{message:"Available plans"}),children:e.jsx(E,{initial:!1,mode:"wait",children:e.jsx(Se,{})})})]})}function Se(){var i,l;const s=C(),[t,a]=d.useState("monthly");return s.isLoading?e.jsx(Be,{},"plan-skeleton"):e.jsxs(d.Fragment,{children:[e.jsx(V,{products:(i=s.data)==null?void 0:i.products,selectedCycle:t,onChange:a,className:"mb-20",size:"md"}),(l=s.data)==null?void 0:l.products.map(r=>{const c=X(t,r.prices);return!c||r.hidden?null:d.createElement(S.div,{..._,key:r.id,className:"justify-between gap-40 border-b py-32 md:flex"},e.jsxs("div",{className:"mb-40 md:mb-0",children:[e.jsx("div",{className:"text-xl font-bold",children:r.name}),e.jsx(v,{price:c,className:"text-lg"}),e.jsx("div",{className:"mt-12 text-base",children:r.description}),e.jsx(_e,{plan:r})]}),e.jsx(ke,{product:r,price:c}))})]},"plan-list")}function _e({plan:s}){return s.feature_list.length?e.jsxs("div",{className:"mt-32",children:[e.jsx("div",{className:"mb-10 text-sm font-semibold",children:e.jsx(n,{message:"What's included"})}),s.feature_list.map(t=>e.jsxs("div",{className:"flex items-center gap-10 text-sm",children:[e.jsx(D,{className:"text-positive",size:"sm"}),e.jsx(n,{message:t})]},t))]}):null}function ke({product:s,price:t}){const{subscription:a}=x();return!(a!=null&&a.price)||!(a!=null&&a.product)?null:a.product_id===s.id&&a.price_id===t.id?e.jsxs("div",{className:"flex w-[168px] items-center justify-center gap-10 text-muted",children:[e.jsx(D,{size:"md"}),e.jsx(n,{message:"Current plan"})]}):e.jsx(m,{variant:"flat",color:"primary",className:"w-[168px]",size:"md",elementType:p,to:`/billing/change-plan/${s.id}/${t.id}/confirm`,children:e.jsx(n,{message:"Continue"})})}function Be(){return e.jsxs(S.div,{..._,className:"border-b py-32 text-2xl",children:[e.jsx(h,{className:"mb-8"}),e.jsx(h,{className:"mb-14"}),e.jsx(h,{className:"mb-24"}),e.jsx(h,{className:"mb-12"})]},"plan-skeleton")}function Le(){const{trans:s}=ee(),t=b();return se({mutationFn:a=>ze(a),onSuccess:()=>{ae(s(y("Plan changed."))),k(),t("/billing")},onError:a=>ne(a)})}function ze({subscriptionId:s,...t}){return T.post(`billing/subscriptions/${s}/change-plan`,t).then(a=>a.data)}const L="/billing/change-plan";function Fe(){const{productId:s,priceId:t}=te(),a=b(),i=C(),{subscription:l}=x(),r=Le();if(!i.data||(l==null?void 0:l.price_id)==t)return e.jsx(M,{to:"/billing/change-plan",replace:!0});const c=i.data.products.find(B=>`${B.id}`===s),u=c==null?void 0:c.prices.find(B=>`${B.id}`===t);if(!c||!u||!l)return a(L),null;const j=e.jsxs("span",{className:"whitespace-nowrap",children:[e.jsx(N,{date:l.renews_at,preset:"long"}),";"]});return e.jsxs(d.Fragment,{children:[e.jsxs(w,{children:[e.jsx(o,{isLink:!0,onSelected:()=>a("/billing"),children:e.jsx(n,{message:"Billing"})}),e.jsx(o,{onSelected:()=>a(L),children:e.jsx(n,{message:"Plans"})}),e.jsx(o,{children:e.jsx(n,{message:"Confirm"})})]}),e.jsx("h1",{className:"text-3xl font-bold my-32 md:my-64",children:e.jsx(n,{message:"Confirm your new plan"})}),e.jsx(f,{title:e.jsx(n,{message:"Changing to"}),children:e.jsxs("div",{className:"max-w-[464px]",children:[e.jsx("div",{className:"text-xl font-bold",children:c.name}),e.jsx(v,{price:u,className:"text-lg"}),e.jsx("div",{className:"text-base mt-12 border-b pb-24 mb-48",children:e.jsx(n,{message:"You will be charged the new price starting :date",values:{date:j}})}),e.jsxs("div",{children:[e.jsx("div",{children:e.jsx(m,{variant:"flat",color:"primary",size:"md",className:"w-full mb-16",onClick:()=>{r.mutate({subscriptionId:l.id,newProductId:c.id,newPriceId:u.id})},disabled:r.isPending,children:e.jsx(n,{message:"Confirm"})})}),e.jsx("div",{children:e.jsx(m,{variant:"outline",className:"w-full",to:L,elementType:p,children:e.jsx(n,{message:"Go back"})})}),e.jsx("div",{className:"text-xs text-muted mt-12",children:e.jsx(n,{message:"By confirming your new plan, you agree to our terms of Service and privacy policy."})})]})]})})]})}const z="/billing";function Re(){const s=b(),t=C(),{subscription:a}=x(),i=de(),l=a==null?void 0:a.product,r=a==null?void 0:a.price;if(!t.data)return null;if(!a||!l||!r)return s(z),null;const c=e.jsx("span",{className:"whitespace-nowrap",children:e.jsx(N,{date:a.renews_at,preset:"long"})}),u=()=>{i.mutate({subscriptionId:a.id},{onSuccess:()=>{k(),s("/billing")}})};return e.jsxs(d.Fragment,{children:[e.jsxs(w,{children:[e.jsx(o,{isLink:!0,onSelected:()=>s(z),children:e.jsx(n,{message:"Billing"})}),e.jsx(o,{children:e.jsx(n,{message:"Cancel"})})]}),e.jsx("h1",{className:"text-3xl font-bold my-32 md:my-64",children:e.jsx(n,{message:"Cancel your plan"})}),e.jsx(f,{title:e.jsx(n,{message:"Current plan"}),children:e.jsxs("div",{className:"max-w-[464px]",children:[e.jsx("div",{className:"text-xl font-bold",children:l.name}),e.jsx(v,{price:r,className:"text-lg"}),e.jsxs("div",{className:"text-base mt-12 border-b pb-24 mb-48",children:[e.jsx(n,{message:"Your plan will be canceled, but is still available until the end of your billing period on :date",values:{date:c}}),e.jsx("div",{className:"mt-20",children:e.jsx(n,{message:"If you change your mind, you can renew your subscription."})})]}),e.jsxs("div",{children:[e.jsx("div",{children:e.jsx(m,{variant:"flat",color:"primary",size:"md",className:"w-full mb-16",onClick:u,disabled:i.isPending,children:e.jsx(n,{message:"Cancel plan"})})}),e.jsx("div",{children:e.jsx(m,{variant:"outline",className:"w-full",to:z,elementType:p,children:e.jsx(n,{message:"Go back"})})}),e.jsx("div",{className:"text-xs text-muted mt-12",children:e.jsx(n,{message:"By cancelling your plan, you agree to our terms of service and privacy policy."})})]})]})})]})}const F="/billing";function Ie(){const s=b(),t=C(),{subscription:a}=x(),i=oe(),l=a==null?void 0:a.product,r=a==null?void 0:a.price;if(!t.data)return null;if(!a||!l||!r)return s(F),null;const c=e.jsxs("span",{className:"whitespace-nowrap",children:[e.jsx(N,{date:a.ends_at,preset:"long"}),";"]}),u=()=>{i.mutate({subscriptionId:a.id},{onSuccess:()=>{k(),s("/billing")}})};return e.jsxs(d.Fragment,{children:[e.jsxs(w,{children:[e.jsx(o,{isLink:!0,onSelected:()=>s(F),children:e.jsx(n,{message:"Billing"})}),e.jsx(o,{children:e.jsx(n,{message:"Renew"})})]}),e.jsx("h1",{className:"text-3xl font-bold my-32 md:my-64",children:e.jsx(n,{message:"Renew your plan"})}),e.jsx(f,{title:e.jsx(n,{message:"Current plan"}),children:e.jsxs("div",{className:"max-w-[464px]",children:[e.jsx("div",{className:"text-xl font-bold",children:l.name}),e.jsx(v,{price:r,className:"text-lg"}),e.jsx("div",{className:"text-base mt-12 border-b pb-24 mb-48",children:e.jsx(n,{message:"This plan will no longer be canceled. It will renew on :date",values:{date:c}})}),e.jsx(m,{variant:"flat",color:"primary",size:"md",className:"w-full mb-16",onClick:u,disabled:i.isPending,children:e.jsx(n,{message:"Renew plan"})}),e.jsx(m,{variant:"outline",className:"w-full",to:F,elementType:p,children:e.jsx(n,{message:"Go back"})}),e.jsx("div",{className:"text-xs text-muted mt-12",children:e.jsx(n,{message:"By renewing your plan, you agree to our terms of service and privacy policy."})})]})})]})}function Te(){const{subscription:s}=x();if(!(s!=null&&s.price)||!(s!=null&&s.product))return null;const t=e.jsx("span",{className:"whitespace-nowrap",children:e.jsx(N,{preset:"long",date:s.ends_at})});return e.jsx(f,{title:e.jsx(n,{message:"Current plan"}),children:e.jsxs("div",{className:"mt-24 flex flex-col justify-between gap-20",children:[e.jsxs("div",{children:[e.jsx(Y,{className:"mb-10 w-min",size:"xs",radius:"rounded",color:"danger",children:e.jsx(n,{message:"Canceled"})}),e.jsx("div",{className:"mb-2 text-xl font-bold",children:s.product.name}),e.jsx(v,{className:"mb-8 text-xl",price:s.price}),e.jsxs("div",{className:"flex items-center gap-8 text-base",children:[e.jsx(he,{size:"sm",className:"text-muted"}),e.jsx("div",{className:"flex-auto",children:e.jsx(n,{message:"Your plan will be canceled on :date",values:{date:t}})})]})]}),e.jsx("div",{className:"w-[233px]",children:e.jsx(m,{variant:"flat",color:"primary",size:"md",className:"mb-12 w-full",elementType:p,to:"/billing/renew",children:e.jsx(n,{message:"Renew plan"})})})]})})}function $e(){const{subscription:s}=x();if(!(s!=null&&s.price)||!(s!=null&&s.product))return null;const t=e.jsx(N,{preset:"long",date:s.renews_at});return e.jsxs(d.Fragment,{children:[s.past_due?e.jsx(qe,{}):null,e.jsx(f,{title:e.jsx(n,{message:"Current plan"}),children:e.jsxs("div",{className:"mt-24 flex justify-between gap-20",children:[e.jsxs("div",{children:[e.jsx("div",{className:"mb-2 text-xl font-bold",children:s.product.name}),e.jsx(v,{className:"mb-2 text-xl",price:s.price}),e.jsx("div",{className:"text-base",children:e.jsx(n,{message:"Your plan renews on :date",values:{date:t}})})]}),e.jsxs("div",{className:"w-[233px]",children:[e.jsx(m,{variant:"flat",color:"primary",size:"md",className:"mb-12 w-full",elementType:p,to:"/billing/change-plan",disabled:s.gateway_name==="none",children:e.jsx(n,{message:"Change plan"})}),e.jsx(m,{variant:"outline",color:"danger",size:"md",className:"w-full",elementType:p,to:"/billing/cancel",children:e.jsx(n,{message:"Cancel plan"})})]})]})})]})}function qe(){return e.jsx(me,{className:"mb-24",color:"danger",title:"Payment is past due",description:"Your recent recurring payment has failed with the payment method we have on file. Please update your payment method to avoid any service interruptions."})}const Me=""+new URL("paypal-c2a77c63.svg",import.meta.url).href;function Ue(){const{user:s,subscription:t}=x();if(!s||!t)return null;const i=t.gateway_name==="paypal"?De:Ee;return e.jsx(f,{title:e.jsx(n,{message:"Payment method"}),children:e.jsx(i,{methodClassName:"whitespace-nowrap text-base max-w-[464px] flex items-center gap-10",linkClassName:"flex items-center gap-4 text-muted mt-18 block hover:underline"})})}function Ee({methodClassName:s,linkClassName:t}){const{user:a}=x();return a?e.jsxs(d.Fragment,{children:[e.jsxs("div",{className:s,children:[e.jsx("span",{className:"capitalize",children:a.card_brand})," ••••",a.card_last_four,a.card_expires&&e.jsx("div",{className:"ml-auto",children:e.jsx(n,{message:"Expires :date",values:{date:a.card_expires}})})]}),e.jsxs(p,{className:t,to:"/billing/change-payment-method",children:[e.jsx(A,{size:"sm"}),e.jsx(n,{message:"Change payment method"})]})]}):null}function De({methodClassName:s,linkClassName:t}){const{subscription:a}=x();return e.jsxs(d.Fragment,{children:[e.jsx("div",{className:s,children:e.jsx(ie,{src:Me})}),e.jsxs("a",{className:t,href:`https://www.sandbox.paypal.com/myaccount/autopay/connect/${a==null?void 0:a.gateway_id}/funding`,target:"_blank",rel:"noreferrer",children:[e.jsx(A,{size:"sm"}),e.jsx(n,{message:"Change payment method"})]})]})}const H="billing/invoices";function Ye(s){return le({queryKey:[H],queryFn:()=>Ae(s)})}function Ae(s){return T.get(H,{params:{userId:s}}).then(t=>t.data)}function Ge(){var i;const{user:s}=x(),t=Ye(s==null?void 0:s.id);if(!s)return null;const a=(i=t.data)==null?void 0:i.invoices;return e.jsx(f,{title:e.jsx(n,{message:"Payment history"}),children:e.jsx("div",{className:"max-w-[464px]",children:e.jsx(E,{initial:!1,mode:"wait",children:t.isLoading?e.jsx(Oe,{},"loading-skeleton"):e.jsx(He,{invoices:a},"invoices")})})})}function He({invoices:s}){const{base_url:t}=I();return e.jsxs(S.div,{..._,children:[s!=null&&s.length?void 0:e.jsx("div",{className:"text-muted italic",children:e.jsx(n,{message:"No invoices yet"})}),s==null?void 0:s.map(a=>{var i;return e.jsxs("div",{className:"whitespace-nowrap text-base flex items-center justify-between gap-10 mb-14",children:[e.jsxs("a",{href:`${t}/billing/invoices/${a.uuid}`,target:"_blank",className:"flex items-center gap-8 hover:underline",rel:"noreferrer",children:[e.jsx(N,{date:a.created_at}),e.jsx(xe,{size:"xs"})]}),a.subscription.price&&e.jsx("div",{children:e.jsx(re,{value:a.subscription.price.amount,currency:a.subscription.price.currency})}),e.jsx(Y,{size:"xs",color:a.paid?"positive":"danger",radius:"rounded",children:a.paid?e.jsx(n,{message:"Paid"}):e.jsx(n,{message:"Unpaid"})}),e.jsx("div",{children:(i=a.subscription.product)==null?void 0:i.name})]},a.id)})]})}function Oe(){return e.jsxs(S.div,{..._,children:[e.jsx(h,{className:"mb-14"}),e.jsx(h,{className:"mb-14"}),e.jsx(h,{className:"mb-14"}),e.jsx(h,{className:"mb-14"}),e.jsx(h,{})]})}function Qe(){const{subscription:s}=x();if(!(s!=null&&s.price)||!(s!=null&&s.product))return null;const t=s.ends_at?e.jsx(Te,{}):e.jsx($e,{});return e.jsxs("div",{children:[t,e.jsx(Ue,{}),e.jsx(Ge,{})]})}function ss(){return e.jsx(ce,{children:e.jsxs(g,{path:"/",element:e.jsx(pe,{children:e.jsx(fe,{})}),children:[e.jsx(g,{index:!0,element:e.jsx(Qe,{})}),e.jsxs(g,{path:"change-payment-method",element:e.jsx(ye,{}),children:[e.jsx(g,{index:!0,element:e.jsx(Ne,{})}),e.jsx(g,{path:"done",element:e.jsx(we,{})})]}),e.jsx(g,{path:"change-plan",element:e.jsx(Ce,{})}),e.jsx(g,{path:"change-plan/:productId/:priceId/confirm",element:e.jsx(Fe,{})}),e.jsx(g,{path:"cancel",element:e.jsx(Re,{})}),e.jsx(g,{path:"renew",element:e.jsx(Ie,{})})]})})}export{ss as default};
//# sourceMappingURL=billing-page-routes-91f9ddc7.js.map