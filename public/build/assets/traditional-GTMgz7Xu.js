import{bH as z,bD as M,R as U}from"./main-D6SjkSWq.js";var R={exports:{}},w={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var g;function C(){if(g)return w;g=1;var r=z();function S(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var v=typeof Object.is=="function"?Object.is:S,f=r.useState,E=r.useEffect,y=r.useLayoutEffect,p=r.useDebugValue;function b(e,t){var n=t(),o=f({inst:{value:n,getSnapshot:t}}),u=o[0].inst,s=o[1];return y(function(){u.value=n,u.getSnapshot=t,d(u)&&s({inst:u})},[e,n,t]),E(function(){return d(u)&&s({inst:u}),e(function(){d(u)&&s({inst:u})})},[e]),p(n),n}function d(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!v(e,n)}catch{return!0}}function i(e,t){return t()}var a=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?i:b;return w.useSyncExternalStore=r.useSyncExternalStore!==void 0?r.useSyncExternalStore:a,w}var q;function F(){return q||(q=1,R.exports=C()),R.exports}var x={exports:{}},V={};/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var I;function G(){if(I)return V;I=1;var r=z(),S=F();function v(i,a){return i===a&&(i!==0||1/i===1/a)||i!==i&&a!==a}var f=typeof Object.is=="function"?Object.is:v,E=S.useSyncExternalStore,y=r.useRef,p=r.useEffect,b=r.useMemo,d=r.useDebugValue;return V.useSyncExternalStoreWithSelector=function(i,a,e,t,n){var o=y(null);if(o.current===null){var u={hasValue:!1,value:null};o.current=u}else u=o.current;o=b(function(){function j(c){if(!D){if(D=!0,m=c,c=t(c),n!==void 0&&u.hasValue){var l=u.value;if(n(l,c))return h=l}return h=c}if(l=h,f(m,c))return l;var _=t(c);return n!==void 0&&n(l,_)?(m=c,l):(m=c,h=_)}var D=!1,m,h,W=e===void 0?null:e;return[function(){return j(a())},W===null?void 0:function(){return j(W())}]},[a,e,t,n]);var s=E(i,o[0],o[1]);return p(function(){u.hasValue=!0,u.value=s},[s]),d(s),s},V}var O;function L(){return O||(O=1,x.exports=G()),x.exports}var $=L();const k=M($),{useSyncExternalStoreWithSelector:H}=k,A=r=>r;function J(r,S=A,v){const f=H(r.subscribe,r.getState,r.getInitialState,S,v);return U.useDebugValue(f),f}export{F as r,J as u,$ as w};
