import{ay as U,cM as Ye,cN as W,cO as ce,r as m,A as j,cP as Z,cQ as qe,cR as O,cS as E,cT as de,cU as fe,aN as q,j as r,R as Ve,a2 as D,bs as Qe,c6 as Xe,aW as Je,ca as et,cb as tt,bo as Ne,cV as at,cW as st,cX as me,bO as rt,cY as J,cZ as ee,cG as _,cF as re,c_ as Pe,aI as Q,a1 as S,bP as Re,cH as A,c$ as nt,d0 as ot,d1 as it,d2 as ct,d3 as lt,d4 as ut,d5 as dt,n as Ie,ad as ne,aX as ft,u as Te,c9 as ze,d6 as Le,d7 as mt,bZ as Se,b_ as Ae,T,az as ht,aH as pt,I as Y,aB as Fe,aC as Me,M as xt,ax as He,E as bt,bc as gt,bi as yt,d8 as vt,bL as he,X as jt,aU as wt,aY as pe,aG as kt}from"./main-4035601d.js";import{K as Dt,u as $t,S as Ct,t as xe}from"./theme-value-to-hex-3fe587b0.js";function Oe(e){return e.set({hour:0,minute:0,second:0,millisecond:0})}function I(e){return e.set({hour:24-1,minute:60-1,second:60-1,millisecond:1e3-1})}function Vt(){var a,s,n;const e=(a=U())==null?void 0:a.settings.dates.default_timezone,t=((n=(s=U())==null?void 0:s.user)==null?void 0:n.timezone)||e||"auto";return!t||t==="auto"?Ye():t}function Nt(){const e=ce();return m.useMemo(()=>{try{return W(e)}catch{return W("UTC")}},[e])}function Pt(){const e=Vt();try{return W(e)}catch{return W("UTC")}}const b=Oe(Pt());var $e,Ce;const te=((Ce=($e=U())==null?void 0:$e.i18n)==null?void 0:Ce.language)||"en",Rt=[{key:0,label:j("Today"),getRangeValue:()=>({preset:0,start:b,end:I(b)})},{key:1,label:j("Yesterday"),getRangeValue:()=>({preset:1,start:b.subtract({days:1}),end:I(b).subtract({days:1})})},{key:2,label:j("This week"),getRangeValue:()=>({preset:2,start:Z(b,te),end:qe(I(b),te)})},{key:3,label:j("Last week"),getRangeValue:()=>{const e=Z(b,te).subtract({days:7});return{preset:3,start:e,end:e.add({days:6})}}},{key:4,label:j("Last 7 days"),getRangeValue:()=>({preset:4,start:b.subtract({days:7}),end:I(b)})},{key:6,label:j("Last 30 days"),getRangeValue:()=>({preset:6,start:b.subtract({days:30}),end:I(b)})},{key:7,label:j("Last 3 months"),getRangeValue:()=>({preset:7,start:b.subtract({months:3}),end:I(b)})},{key:8,label:j("Last 12 months"),getRangeValue:()=>({preset:8,start:b.subtract({months:12}),end:I(b)})},{key:9,label:j("This month"),getRangeValue:()=>({preset:9,start:O(b),end:E(I(b))})},{key:10,label:j("This year"),getRangeValue:()=>({preset:10,start:de(b),end:fe(I(b))})},{key:11,label:j("Last year"),getRangeValue:()=>({preset:11,start:de(b).subtract({years:1}),end:fe(I(b)).subtract({years:1})})}],It=q(r.jsx("path",{d:"M7 11h2v2H7v-2zm14-5v14c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2l.01-14c0-1.1.88-2 1.99-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2zM5 8h14V6H5v2zm14 12V10H5v10h14zm-4-7h2v-2h-2v2zm-4 0h2v-2h-2v2z"}),"DateRangeOutlined"),Tt=Ve.forwardRef((e,t)=>{const{children:a,inputProps:s,wrapperProps:n,className:o,autoFocus:l,style:i,onClick:c}=e;return r.jsx("div",{...n,onClick:c,children:r.jsx("div",{...s,role:"group",className:D(o,"flex items-center focus-within:ring focus-within:ring-primary/focus focus-within:border-primary/60"),ref:t,style:i,children:r.jsx(Qe,{autoFocus:l,children:a})})})}),zt=Ve.forwardRef(({inputRef:e,wrapperProps:t,children:a,onBlur:s,...n},o)=>{const l=Xe(n),i=Je(o),{fieldProps:c,inputProps:h}=et({...n,focusRef:i,labelElementType:"span"});return l.wrapper=D(l.wrapper,n.disabled&&"pointer-events-none"),r.jsx(tt,{wrapperProps:Ne(t,{onBlur:d=>{var f;(f=i.current)!=null&&f.contains(d.relatedTarget)||s==null||s(d)},onClick:()=>{const d=at(i);d==null||d.focusFirst()}}),fieldClassNames:l,ref:i,...c,children:r.jsx(Tt,{inputProps:h,className:D(l.input,"gap-10"),ref:e,children:a})})});function Lt(e){return e instanceof st?"day":"minute"}function oe(e,t,a){return t!=null&&e.compare(t)<0||a!=null&&e.compare(a)>0}function F(e,t,a){try{return me(e,t,a)}catch{return me(e,"UTC",a)}}function St(e,t){const a=ce(),[s,n]=m.useState(!1),o=t.closeDialogOnSelection??!0,l=t.granularity||Lt(e),i=t.min?F(t.min,a):void 0,c=t.max?F(t.max,a):void 0;return{timezone:a,granularity:l,min:i,max:c,calendarIsOpen:s,setCalendarIsOpen:n,closeDialogOnSelection:o}}function be(e){var le,ue;const t=Nt(),[a,s]=m.useState({start:(!e.value||!e.value.start)&&!((le=e.defaultValue)!=null&&le.start),end:(!e.value||!e.value.end)&&!((ue=e.defaultValue)!=null&&ue.end)}),n=e.onChange,[o,l]=rt(e.value?se(e.value,t):void 0,e.value?void 0:se(e.defaultValue,t),x=>{s({start:!1,end:!1}),n==null||n(x)}),{min:i,max:c,granularity:h,timezone:d,calendarIsOpen:f,setCalendarIsOpen:p,closeDialogOnSelection:y}=St(o.start,e),w=m.useCallback(()=>{s({start:!0,end:!0}),l(se(null,t)),n==null||n(null),p(!1)},[t,l,n,p]),[v,z]=m.useState(null),[k,$]=m.useState(!1),[P,M]=m.useState(o),[X,B]=m.useState(()=>ge(o,c)),u=m.useCallback(x=>{let V=x.start,N=x.end;i&&(V=J(V,i));const We=c?ee(c,N):N;V=ee(V,We);const Ze=i?J(i,V):V;return N=J(N,Ze),c&&(N=ee(N,c)),{start:F(V,d),end:F(N,d)}},[i,c,d]),g=m.useCallback(x=>{const V={...u(x),preset:x.preset};l(V),M(V),B(ge(V,c)),s({start:!1,end:!1})},[l,u,c]),C=m.useCallback(x=>!a.start&&_(x,P.start)||!a.end&&_(x,P.end),[P,a]),L=m.useCallback(x=>(k||!a.start&&!a.end)&&x.compare(P.start)>=0&&x.compare(P.end)<=0,[P,a,k]),G=m.useCallback(x=>_(x,P.start),[P]),K=m.useCallback(x=>_(x,P.end),[P]),Ue=m.useCallback((x,V)=>({onPointerEnter:()=>{k&&V&&M(ae({start:v,end:x,timezone:d}))},onClick:()=>{if(!k)$(!0),z(x),M(ae({start:x,end:x,timezone:d}));else{const N=ae({start:v,end:x,timezone:d});N.start=Oe(N.start),N.end=I(N.end),$(!1),z(null),g==null||g(N),y&&(p==null||p(!1))}}}),[v,k,g,p,y,d]);return{selectedValue:o,setSelectedValue:g,calendarIsOpen:f,setCalendarIsOpen:p,dayIsActive:C,dayIsHighlighted:L,dayIsRangeStart:G,dayIsRangeEnd:K,getCellProps:Ue,calendarDates:X,setIsPlaceholder:s,isPlaceholder:a,clear:w,setCalendarDates:B,min:i,max:c,granularity:h,timezone:d,closeDialogOnSelection:y}}function ge(e,t){let a=re(O(e.start)),s=re(E(e.end));return Pe(a,s)&&(s=E(s.add({months:1}))),t&&s.compare(t)>0&&(s=a,a=O(a.subtract({months:1}))),[a,s]}function ae(e){const t=F(e.start,e.timezone),a=F(e.end,e.timezone);return t.compare(a)>0?{start:a,end:t}:{start:t,end:a}}function se(e,t){return e!=null&&e.start&&(e!=null&&e.end)?e:!(e!=null&&e.start)&&(e!=null&&e.end)?(e.start=e.end.subtract({months:1}),e):!(e!=null&&e.end)&&(e!=null&&e.start)?(e.end=e.start.add({months:1}),e):{start:t,end:t.add({months:1})}}const At=q(r.jsx("path",{d:"M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z"}),"ArrowRightAltOutlined");function Ft(e,t,a,s){switch(t){case"era":case"year":case"month":case"day":return e.cycle(t,a,{round:t==="year"})}if("hour"in e)switch(t){case"dayPeriod":{const n=e.hour,o=n>=12;return e.set({hour:o?n-12:n+12})}case"hour":case"minute":case"second":return e.cycle(t,a,{round:t!=="hour",hourCycle:s.hour12?12:24})}return e}function Mt(e,t,a,s){switch(t){case"day":case"month":case"year":return e.set({[t]:a})}if("hour"in e)switch(t){case"dayPeriod":{const n=e.hour,o=n>=12;return a>=12===o?e:e.set({hour:o?n-12:n+12})}case"hour":if(s.hour12){const o=e.hour>=12;!o&&a===12&&(a=0),o&&a<12&&(a+=12)}case"minute":case"second":return e.set({[t]:a})}return e}const ye={year:5,month:2,day:7,hour:2,minute:15,second:15,dayPeriod:1};function Ht({segment:e,domProps:t,value:a,onChange:s,isPlaceholder:n,state:{timezone:o,calendarIsOpen:l,setCalendarIsOpen:i}}){const c=Q(),h=m.useRef(""),{localeCode:d}=S(),f=Re(),p=A({timeZone:o}),y=m.useMemo(()=>new nt(d,{maximumFractionDigits:0}),[d]),w=u=>{s(Mt(a,e.type,u,p.resolvedOptions()))},v=u=>{s(Ft(a,e.type,u,p.resolvedOptions()))},z=()=>{if(y.isValidPartialNumber(e.text)){const u=e.text.slice(0,-1),g=y.parse(u);if(u.length===0||g===0){const C=ot(o);e.type in C&&w(C[e.type])}else w(g);h.current=u}else e.type==="dayPeriod"&&v(-1)},k=u=>{var g;if(!(u.ctrlKey||u.metaKey||u.shiftKey||u.altKey)){switch(u.key){case"ArrowLeft":u.preventDefault(),u.stopPropagation(),f==null||f.focusPrevious();break;case"ArrowRight":u.preventDefault(),u.stopPropagation(),f==null||f.focusNext();break;case"Enter":(g=u.target.closest("form"))==null||g.requestSubmit(),i(!l);break;case"Tab":break;case"Backspace":case"Delete":{u.preventDefault(),u.stopPropagation(),z();break}case"ArrowUp":u.preventDefault(),h.current="",v(1);break;case"ArrowDown":u.preventDefault(),h.current="",v(-1);break;case"PageUp":u.preventDefault(),h.current="",v(ye[e.type]||1);break;case"PageDown":u.preventDefault(),h.current="",v(-(ye[e.type]||1));break;case"Home":u.preventDefault(),h.current="",w(e.maxValue);break;case"End":u.preventDefault(),h.current="",w(e.minValue);break}X(u.key)}},$=A({hour:"numeric",hour12:!0}),P=m.useMemo(()=>{const u=new Date;return u.setHours(0),$.formatToParts(u).find(g=>g.type==="dayPeriod").value},[$]),M=m.useMemo(()=>{const u=new Date;return u.setHours(12),$.formatToParts(u).find(g=>g.type==="dayPeriod").value},[$]),X=u=>{const g=h.current+u;switch(e.type){case"dayPeriod":if(P.toLowerCase().startsWith(u))w(0);else if(M.toLowerCase().startsWith(u))w(12);else break;f==null||f.focusNext();break;case"day":case"hour":case"minute":case"second":case"month":case"year":{if(!y.isValidPartialNumber(g))return;let C=y.parse(g),L=C,G=e.minValue===0;if(e.type==="hour"&&p.resolvedOptions().hour12){switch(p.resolvedOptions().hourCycle){case"h11":C>11&&(L=y.parse(u));break;case"h12":G=!1,C>12&&(L=y.parse(u));break}e.value>=12&&C>1&&(C+=12)}else C>e.maxValue&&(L=y.parse(u));if(Number.isNaN(C))return;const K=L!==0||G;K&&w(L),+`${C}0`>e.maxValue||g.length>=String(e.maxValue).length?(h.current="",K&&(f==null||f.focusNext())):h.current=g;break}}},B=c?{}:{"aria-label":e.type,"aria-valuetext":n?void 0:`${e.value}`,"aria-valuemin":e.minValue,"aria-valuemax":e.maxValue,"aria-valuenow":n?void 0:e.value,tabIndex:0,onKeyDown:k};return r.jsx("div",{...Ne(t,{...B,onFocus:u=>{h.current="",u.target.scrollIntoView({block:"nearest"})},onClick:u=>{u.preventDefault(),u.stopPropagation()}}),className:"box-content cursor-default select-none whitespace-nowrap rounded p-2 text-center tabular-nums caret-transparent outline-none focus:bg-primary focus:text-on-primary",children:e.text.padStart(e.minLength,"0")})}function Ot({segment:e,domProps:t}){const a=Re();return r.jsx("div",{...t,onPointerDown:s=>{s.pointerType==="mouse"&&(s.preventDefault(),a!=null&&a.focusNext({from:s.target})||a==null||a.focusPrevious({from:s.target}))},"aria-hidden":!0,className:"min-w-4 cursor-default select-none",children:e.text})}function Et(e,t,a){switch(t){case"year":return{value:e.year,placeholder:"yyyy",minValue:1,maxValue:e.calendar.getYearsInEra(e)};case"month":return{value:e.month,placeholder:"mm",minValue:ct(e),maxValue:e.calendar.getMonthsInYear(e)};case"day":return{value:e.day,minValue:it(e),maxValue:e.calendar.getDaysInMonth(e),placeholder:"dd"}}if("hour"in e)switch(t){case"dayPeriod":return{value:e.hour>=12?12:0,minValue:0,maxValue:12,placeholder:"--"};case"hour":if(a.hour12){const s=e.hour>=12;return{value:e.hour,minValue:s?12:0,maxValue:s?23:11,placeholder:"--"}}return{value:e.hour,minValue:0,maxValue:23,placeholder:"--"};case"minute":return{value:e.minute,minValue:0,maxValue:59,placeholder:"--"}}return{}}function ve({segmentProps:e,state:t,value:a,onChange:s,isPlaceholder:n}){const{granularity:o}=t,l=m.useMemo(()=>{const d={year:"numeric",month:"numeric",day:"numeric"};return o==="minute"&&(d.hour="numeric",d.minute="numeric"),d},[o]),i=A(l),c=m.useMemo(()=>a.toDate(),[a]),h=m.useMemo(()=>i.formatToParts(c).map(d=>{const f=Et(a,d.type,i.resolvedOptions()),p=n&&d.type!=="literal"?f.placeholder:d.value;return{type:d.type,text:d.value===", "?" ":p,...f,minLength:d.type!=="literal"?String(f.maxValue).length:1}}),[c,i,n,a]);return r.jsx("div",{className:"flex items-center",children:h.map((d,f)=>d.type==="literal"?r.jsx(Ot,{domProps:e,segment:d},f):r.jsx(Ht,{isPlaceholder:n,domProps:e,state:t,value:a,onChange:s,segment:d},f))})}function Bt({date:e,currentMonth:t,state:{dayIsActive:a,dayIsHighlighted:s,dayIsRangeStart:n,dayIsRangeEnd:o,getCellProps:l,timezone:i,min:c,max:h}}){const{localeCode:d}=S(),f=lt(e,d),p=a(e),y=s(e),w=n(e),v=o(e),z=ut(e,i),k=Pe(e,t),$=oe(e,c,h);return r.jsxs("div",{role:"button","aria-disabled":$,className:D("relative isolate h-40 w-40 flex-shrink-0 text-sm",$&&"pointer-events-none text-disabled",!k&&"pointer-events-none invisible"),...l(e,k),children:[r.jsx("span",{className:D("absolute inset-0 z-10 flex h-full w-full cursor-pointer select-none items-center justify-center rounded-full",!p&&!z&&"hover:bg-hover",p&&"bg-primary font-semibold text-on-primary",z&&!p&&"bg-chip"),children:e.day}),y&&k&&r.jsx("span",{className:D("absolute inset-0 h-full w-full bg-primary/focus",(w||f===0||e.day===1)&&"rounded-l-full",(v||f===6||e.day===t.calendar.getDaysInMonth(t))&&"rounded-r-full")})]})}function Gt({startDate:e,state:t,isFirst:a,isLast:s}){const{localeCode:n}=S(),o=dt(e,n),l=Z(e,n);return r.jsxs("div",{className:"w-280 flex-shrink-0",children:[r.jsx(Kt,{isFirst:a,isLast:s,state:t,currentMonth:e}),r.jsxs("div",{className:"block",role:"grid",children:[r.jsx(_t,{state:t,startDate:e}),[...new Array(o).keys()].map(i=>r.jsx(Ie.div,{className:"mb-6 flex",children:[...new Array(7).keys()].map(c=>r.jsx(Bt,{date:l.add({weeks:i,days:c}),currentMonth:e,state:t},c))},i))]})]})}function Kt({currentMonth:e,isFirst:t,isLast:a,state:{calendarDates:s,setCalendarDates:n,timezone:o,min:l,max:i}}){const c=p=>{const y=s.length;let w;p==="forward"?w=s.map(v=>E(v.add({months:y}))):w=s.map(v=>E(v.subtract({months:y}))),n(w)},h=A({month:"long",year:"numeric",era:e.calendar.identifier!=="gregory"?"long":void 0,calendar:e.calendar.identifier}),d=oe(e.subtract({days:1}),l,i),f=oe(O(e.add({months:1})),l,i);return r.jsxs("div",{className:"flex items-center justify-between gap-10",children:[r.jsx(ne,{size:"md",className:D("text-muted",!t&&"invisible"),disabled:!t||d,"aria-hidden":!t,onClick:()=>{c("backward")},children:r.jsx(ft,{})}),r.jsx("div",{className:"select-none text-sm font-semibold",children:h.format(e.toDate(o))}),r.jsx(ne,{size:"md",className:D("text-muted",!a&&"invisible"),disabled:!a||f,"aria-hidden":!a,onClick:()=>{c("forward")},children:r.jsx(Dt,{})})]})}function _t({state:{timezone:e},startDate:t}){const{localeCode:a}=S(),s=A({weekday:"short"}),n=Z(t,a);return r.jsx("div",{className:"flex",children:[...new Array(7).keys()].map(o=>{const i=n.add({days:o}).toDate(e),c=s.format(i);return r.jsx("div",{className:"relative h-40 w-40 flex-shrink-0 text-sm font-semibold",children:r.jsx("div",{className:"absolute flex h-full w-full select-none items-center justify-center",children:c})},o)})})}function Ut({state:e,visibleMonths:t=1}){return Q()&&(t=1),r.jsx(m.Fragment,{children:[...new Array(t).keys()].map(s=>{const n=re(O(e.calendarDates[s])),o=s===0,l=s===t-1;return r.jsx(Gt,{state:e,startDate:n,isFirst:o,isLast:l},s)})})}const Ee=m.memo(({start:e,end:t,options:a,preset:s})=>{const{dates:n}=Te(),o=ce(),l=A(a||ze[s||(n==null?void 0:n.format)]);if(!e||!t)return null;let i;try{i=l.formatRange(je(e,o),je(t,o))}catch{i=""}return r.jsx(m.Fragment,{children:i})},Le);function je(e,t){return typeof e=="string"?mt(e,t).toDate():"toDate"in e?e.toDate(t):e}function Wt({onPresetSelected:e,selectedValue:t}){return r.jsx(Se,{children:Rt.map(a=>r.jsx(Ae,{borderRadius:"rounded-none",capitalizeFirst:!0,isSelected:(t==null?void 0:t.preset)===a.key,onSelected:()=>{const s=a.getRangeValue();e(s)},children:r.jsx(T,{...a.label})},a.key))})}const Be=[{key:0,label:j("Preceding period"),getRangeValue:e=>{const t=e.start,n=(e.end.toDate().getTime()-t.toDate().getTime())/(1e3*60);return{preset:0,start:t.subtract({minutes:n}),end:t}}},{key:1,label:j("Same period last year"),getRangeValue:e=>({start:e.start.subtract({years:1}),end:e.end.subtract({years:1}),preset:1})},{key:2,label:j("Custom"),getRangeValue:e=>({start:e.start.subtract({weeks:1}),end:e.end.subtract({weeks:1}),preset:2})}];function Zt({originalRangeValue:e,onPresetSelected:t,selectedValue:a}){return r.jsx(Se,{children:Be.map(s=>r.jsx(Ae,{borderRadius:"rounded-none",capitalizeFirst:!0,isSelected:(a==null?void 0:a.preset)===s.key,onSelected:()=>{const n=s.getRangeValue(e);t(n)},children:r.jsx(T,{...s.label})},s.key))})}function Yt({state:e,compareState:t,showInlineDatePickerField:a=!1,compareVisibleDefault:s=!1}){const n=$t(),{close:o}=ht(),l=m.useRef(e),i=e.isPlaceholder.start||e.isPlaceholder.end,[c,h]=m.useState(s),d=r.jsxs(pt,{dividerTop:!0,startAction:!i&&!n?r.jsx("div",{className:"text-xs",children:r.jsx(Ee,{start:e.selectedValue.start.toDate(),end:e.selectedValue.end.toDate(),options:{dateStyle:"medium"}})}):void 0,children:[r.jsx(Y,{variant:"text",size:"xs",onClick:()=>{e.setSelectedValue(l.current.selectedValue),e.setIsPlaceholder(l.current.isPlaceholder),o()},children:r.jsx(T,{message:"Cancel"})}),r.jsx(Y,{variant:"flat",color:"primary",size:"xs",onClick:()=>{const f=e.selectedValue;t&&c&&(f.compareStart=t.selectedValue.start,f.compareEnd=t.selectedValue.end),o(f)},children:r.jsx(T,{message:"Select"})})]});return r.jsxs(Fe,{size:"auto",children:[r.jsxs(Me,{className:"flex",padding:"p-0",children:[!n&&r.jsxs("div",{className:"min-w-192 py-14",children:[r.jsx(Wt,{selectedValue:e.selectedValue,onPresetSelected:f=>{e.setSelectedValue(f),e.closeDialogOnSelection&&o(f)}}),!!t&&r.jsxs(m.Fragment,{children:[r.jsx(Ct,{className:"mx-20 mb-10 mt-14",checked:c,onChange:f=>h(f.target.checked),children:r.jsx(T,{message:"Compare"})}),c&&r.jsx(Zt,{originalRangeValue:e.selectedValue,selectedValue:t.selectedValue,onPresetSelected:f=>{t.setSelectedValue(f)}})]})]}),r.jsx(xt,{initial:!1,children:r.jsx(qt,{state:e,compareState:t,showInlineDatePickerField:a,compareVisible:c})})]}),!e.closeDialogOnSelection&&d]})}function qt({state:e,compareState:t,showInlineDatePickerField:a,compareVisible:s}){return r.jsxs(Ie.div,{initial:{width:0,overflow:"hidden"},animate:{width:"auto"},exit:{width:0,overflow:"hidden"},transition:{type:"tween",duration:.125},className:"border-l px-20 pb-20 pt-10",children:[a&&r.jsxs("div",{children:[r.jsx(we,{state:e}),!!t&&s&&r.jsx(we,{state:t,label:r.jsx(T,{message:"Compare"})})]}),r.jsx("div",{className:"flex items-start gap-36",children:r.jsx(Ut,{state:e,visibleMonths:2})})]})}function we({state:e,label:t}){const{selectedValue:a,setSelectedValue:s}=e;return r.jsxs(zt,{className:"mb-20 mt-10",label:t,children:[r.jsx(ve,{state:e,value:a.start,onChange:n=>{s({...a,start:n})}}),r.jsx(At,{className:"block flex-shrink-0 text-muted",size:"md"}),r.jsx(ve,{state:e,value:a.end,onChange:n=>{s({...a,end:n})}})]})}const Qt=q(r.jsx("path",{d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"}),"ArrowBackOutlined"),Xt=q(r.jsx("path",{d:"M9 8a1 1 0 0 0-1-1H5.5a1 1 0 1 0 0 2H7v4a1 1 0 0 0 2 0zM4 0h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4zm4 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"}),"InfoDialogTrigger"),Jt={month:"short",day:"2-digit"};function fa({value:e,onChange:t,disabled:a,compactOnMobile:s=!0,enableCompare:n=!1,granularity:o="minute"}){const l=Q();return r.jsxs(He,{type:"popover",onClose:i=>{i&&t(i)},children:[r.jsx(Y,{variant:"outline",color:"chip",endIcon:r.jsx(It,{}),disabled:a,children:r.jsx(Ee,{start:e.start,end:e.end,options:l&&s?Jt:ze.short})}),r.jsx(ea,{value:e,enableCompare:n,granularity:o})]})}function ea({value:e,enableCompare:t,granularity:a}){const s=Q(),n=be({granularity:a,defaultValue:{start:e.start,end:e.end,preset:e.preset},closeDialogOnSelection:!1}),o=!!e.compareStart&&!!e.compareEnd,l=be({granularity:a,defaultValue:o?{start:e.compareStart,end:e.compareEnd,preset:e.comparePreset}:Be[0].getRangeValue(n.selectedValue)});return r.jsx(Yt,{state:n,compareState:t?l:void 0,compareVisibleDefault:o,showInlineDatePickerField:!s})}function Ge(e){const{title:t,description:a,children:s,className:n,contentIsFlex:o=!0,contentClassName:l,contentRef:i,minHeight:c="min-h-440"}=e;return r.jsxs("div",{className:D("flex h-full flex-auto flex-col rounded-panel border bg dark:bg-alt",c,n),children:[r.jsxs("div",{className:"flex flex-shrink-0 items-center justify-between p-14 text-xs",children:[r.jsx("div",{className:"text-sm font-semibold",children:t}),a&&r.jsx("div",{className:"text-muted",children:a})]}),r.jsx("div",{ref:i,className:D("relative p-14",o&&"flex flex-auto items-center justify-center",l),children:s})]})}function ie(){return r.jsxs("div",{className:"absolute mx-auto flex items-center gap-10 text-sm",children:[r.jsx(bt,{isIndeterminate:!0,size:"sm"}),r.jsx(T,{message:"Chart loading"})]})}const ta=m.lazy(()=>gt(()=>import("./lazy-chart-22f9e624.js"),["./lazy-chart-22f9e624.js","./main-4035601d.js","./main-91159e3f.css"],import.meta.url));function Ke(e){const{title:t,description:a,className:s,contentRef:n,isLoading:o}=e;return r.jsx(Ge,{title:t,description:a,className:s,contentRef:n,children:r.jsxs(m.Suspense,{fallback:r.jsx(ie,{}),children:[r.jsx(ta,{...e}),o&&r.jsx(ie,{})]})})}function _e(e,{localeCode:t="en",shareFirstDatasetLabels:a=!0}){if(!e)return{datasets:[]};const s=[];return{...e,datasets:e.datasets.map((n,o)=>{const l=n.data.map((i,c)=>{let h;return o===0||!a?(h=aa(i,e.granularity,t),s[c]=h):h=s[c],{...h,value:i.value}});return{...n,data:l}})}}function aa(e,t,a){return e.label?{label:e.label}:e.date?sa(e,t,a):{label:""}}function sa({date:e,endDate:t},a="day",s){const n=he(e).toDate(),o=t?he(t).toDate():null;switch(a){case"minute":return{label:R(s,{second:"2-digit"}).format(n),tooltipTitle:R(s,{day:"2-digit",hour:"numeric",minute:"numeric",second:"2-digit"}).format(n)};case"hour":return{label:R(s,{hour:"numeric",minute:"numeric"}).format(n),tooltipTitle:R(s,{month:"short",day:"2-digit",hour:"numeric",minute:"numeric"}).format(n)};case"day":return{label:R(s,{day:"2-digit",weekday:"short"}).format(n),tooltipTitle:R(s,{day:"2-digit",weekday:"short",month:"short"}).format(n)};case"week":return{label:R(s,{month:"short",day:"2-digit"}).format(n),tooltipTitle:R(s,{day:"2-digit",month:"long",year:"numeric"}).formatRange(n,o)};case"month":return{label:R(s,{month:"short",year:"numeric"}).format(n),tooltipTitle:R(s,{month:"long",year:"numeric"}).format(n)};case"year":return{label:R(s,{year:"numeric"}).format(n),tooltipTitle:R(s,{year:"numeric"}).format(n)}}}const R=yt((e,t)=>new vt(e,t),{equals:(e,t)=>Le(e,t),callTimeout:void 0}),ke=U().themes[0].values["--be-primary"],H=[[`rgb(${ke.replaceAll(" ",",")})`,`rgba(${ke.replaceAll(" ",",")},0.2)`],["rgb(255,112,67)","rgb(255,112,67,0.2)"],["rgb(255,167,38)","rgb(255,167,38,0.2)"],["rgb(141,110,99)","rgb(141,110,99,0.2)"],["rgb(102,187,106)","rgba(102,187,106,0.2)"],["rgb(92,107,192)","rgb(92,107,192,0.2)"]],ra={parsing:{xAxisKey:"label",yAxisKey:"value"},datasets:{line:{fill:"origin",tension:.1,pointBorderWidth:4,pointHitRadius:10}},plugins:{tooltip:{intersect:!1,mode:"index"}}};function ma({data:e,className:t,...a}){const{localeCode:s}=S(),n=m.useMemo(()=>{const o=_e(e,{localeCode:s});return o.datasets=o.datasets.map((l,i)=>({...l,backgroundColor:H[i][1],borderColor:H[i][0],pointBackgroundColor:H[i][0]})),o},[e,s]);return r.jsx(Ke,{...a,className:D(t,"min-w-500"),data:n,type:"line",options:ra})}const na={parsing:{key:"value"},plugins:{tooltip:{intersect:!0}}};function ha({data:e,className:t,...a}){const{localeCode:s}=S(),n=m.useMemo(()=>{var l;const o=_e(e,{localeCode:s});return o.labels=(l=o.datasets[0])==null?void 0:l.data.map(i=>i.label),o.datasets=o.datasets.map((i,c)=>({...i,backgroundColor:H.map(h=>h[1]),borderColor:H.map(h=>h[0]),borderWidth:2})),o},[e,s]);return r.jsx(Ke,{type:"polarArea",data:n,options:na,className:D(t,"min-w-500"),...a})}const De="https://www.gstatic.com/charts/loader.js";function oa({placeholderRef:e,data:t,country:a,onCountrySelected:s}){const{trans:n}=jt(),{analytics:o}=Te(),l=o==null?void 0:o.gchart_api_key,{selectedTheme:i}=wt(),c=m.useRef(),h=!!s&&!a,d=m.useCallback(()=>{var z,k;if(typeof google>"u")return;const p=t.map($=>[$.label,$.value]);p.unshift([n(a?j("City"):j("Country")),n(j("Clicks"))]);const y=`${xe(i.values["--be-paper"])}`,v={colorAxis:{colors:[`${xe(i.values["--be-primary"])}`]},backgroundColor:y,region:a?a.toUpperCase():void 0,resolution:a?"provinces":"countries",displayMode:a?"markers":"regions",enableRegionInteractivity:h};!c.current&&e.current&&((z=google==null?void 0:google.visualization)!=null&&z.GeoChart)&&(c.current=new google.visualization.GeoChart(e.current)),(k=c.current)==null||k.draw(google.visualization.arrayToDataTable(p),v)},[i,t,e,n,a,h]),f=m.useCallback(async()=>{pe.isLoadingOrLoaded(De)||(await pe.loadAsset(De,{type:"js",id:"google-charts-js"}),await google.charts.load("current",{packages:["geochart"],mapsApiKey:l}),d())},[l,d]);return m.useEffect(()=>(c.current&&s&&google.visualization.events.addListener(c.current,"regionClick",p=>s==null?void 0:s(p.region)),()=>{c.current&&google.visualization.events.removeAllListeners(c.current)}),[s,c.current]),m.useEffect(()=>{f()},[f]),m.useEffect(()=>{d()},[i,d,t]),{drawGoogleChart:d}}function ia({title:e,body:t,dialogSize:a="sm",className:s}){return r.jsxs(He,{type:"popover",triggerOnHover:!0,children:[r.jsx(ne,{className:D("ml-4 text-muted opacity-70",s),iconSize:"xs",size:"2xs",children:r.jsx(Xt,{viewBox:"0 0 16 16"})}),r.jsxs(Fe,{size:a,children:[e&&r.jsx(kt,{padding:"px-18 pt-12",size:"md",hideDismissButton:!0,children:e}),r.jsx(Me,{children:t})]})]})}const ca=m.memo(({code:e})=>{const{localeCode:t}=S(),a=new Intl.DisplayNames([t],{type:"region"});let s;try{s=a.of(e.toUpperCase())}catch{}return r.jsx(m.Fragment,{children:s})});function pa({data:e,isLoading:t,onCountrySelected:a,country:s,...n}){const o=m.useRef(null),l=!!a,i=e==null?void 0:e.datasets[0].data,c=m.useMemo(()=>i||[],[i]);return oa({placeholderRef:o,data:c,country:s,onCountrySelected:a}),r.jsxs(Ge,{...n,className:"min-w-500",title:r.jsxs("div",{className:"flex items-center",children:[r.jsx(T,{message:"Top Locations"}),s?r.jsxs("span",{className:"pl-4",children:["(",r.jsx(ca,{code:s}),")"]}):null,l&&r.jsx(la,{})]}),contentIsFlex:t,children:[t&&r.jsx(ie,{}),r.jsxs("div",{className:"flex gap-24",children:[r.jsx("div",{ref:o,className:"min-h-[340px] w-[480px] flex-auto"}),r.jsxs("div",{className:"w-[170px]",children:[r.jsx("div",{className:"max-h-[340px] w-full flex-initial overflow-y-auto text-sm",children:c.map(h=>r.jsxs("div",{className:D("mb-4 flex items-center gap-4",l&&"cursor-pointer hover:underline"),role:l?"button":void 0,onClick:()=>{a==null||a(h.code)},children:[r.jsx("div",{className:"max-w-110 overflow-hidden overflow-ellipsis whitespace-nowrap",children:h.label}),r.jsxs("div",{children:["(",h.percentage,")%"]})]},h.label))}),s&&r.jsx(Y,{variant:"outline",size:"xs",className:"mt-14",startIcon:r.jsx(Qt,{}),onClick:()=>{a==null||a(void 0)},children:r.jsx(T,{message:"Back to countries"})})]})]})]})}function la(){return r.jsx(ia,{title:r.jsx(T,{message:"Zooming in"}),body:r.jsx(T,{message:"Click on a country inside the map or country list to zoom in and see city data for that country."})})}export{At as A,Ke as B,H as C,Rt as D,Ee as F,pa as G,ia as I,ma as L,ha as P,fa as R,Yt as a,zt as b,It as c,ve as d,Nt as e,Qt as f,_e as g,Tt as h,St as i,Ut as j,Xt as k,Ge as l,ie as m,F as t,be as u};
//# sourceMappingURL=geo-chart-ecbbcd4f.js.map