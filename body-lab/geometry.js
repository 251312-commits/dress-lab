"use strict";
// Parametric Bézier parts; no raster grid warp.
window.DressLabBodyGeometry = function geometry(state){
 const delta=(k)=>(Number(state[k]??100)-100)/100,c=126;
 const sh=61+delta("shoulders")*60,bust=51+delta("bust")*50,waist=37+delta("waist")*43,hips=64+delta("hips")*61;
 const armWidth=1+delta("arms")*.76,thighWidth=1+delta("thighs")*.9,calfWidth=1+delta("calves")*.86;
 const headSize=1+delta("head"),neckLift=delta("neck")*36,ratio=delta("ratio")*86;
 const wy=309+ratio,hipY=wy+71,knee=503+ratio*.3,ankle=681;
 const elbow=290+delta("armLength")*34,wrist=397+delta("armLength")*90;
 const ax=sh+24,wx=sh+40,sx=c-sh,el=c-ax,wr=c-wx;
 const f=(n)=>Math.round(n*100)/100;
 const hs=(x,y)=>[f(c+(x-c)*headSize),f(140+(y-140)*headSize-neckLift)].join(" ");
 const head=[
  "M",hs(126,19),"C",hs(100,18),hs(84,39),hs(83,73),
  "C",hs(76,71),hs(73,79),hs(78,94),
  "C",hs(82,104),hs(87,108),hs(91,108),
  "C",hs(96,125),hs(110,135),hs(126,141),
  "C",hs(142,135),hs(156,125),hs(161,108),
  "C",hs(165,108),hs(170,104),hs(174,94),
  "C",hs(179,79),hs(175,71),hs(169,73),
  "C",hs(168,39),hs(152,18),hs(126,19),"Z"
 ].join(" ");
 const neck=["M",114,f(124-neckLift),"C",114,151,110,155,98,161,"L",93,179,"Q",126,196,159,179,"L",154,161,"C",142,155,138,151,138,f(124-neckLift),"Z"].join(" ");
 const torso=[
  "M",f(c-sh),169,"C",f(c-sh+3),161,95,158,101,157,"Q",126,172,151,157,
  "C",157,158,f(c+sh-3),161,f(c+sh),169,
  "C",f(c+sh+5),190,f(c+bust+8),210,f(c+bust),233,
  "C",f(c+bust-1),257,f(c+waist+6),278,f(c+waist),f(wy),
  "L",f(c+waist-1),f(wy+26),"Q",126,f(wy+31),f(c-waist+1),f(wy+26),
  "L",f(c-waist),f(wy),
  "C",f(c-waist-6),278,f(c-bust+1),257,f(c-bust),233,
  "C",f(c-bust-8),210,f(c-sh-5),190,f(c-sh),169,"Z"
 ].join(" ");
 const torsoLine=[
  "M",f(c-waist),f(wy+23),"L",f(c-waist),f(wy),
  "C",f(c-waist-6),278,f(c-bust+1),257,f(c-bust),233,
  "C",f(c-bust-8),210,f(c-sh-5),190,f(c-sh),169,
  "C",f(c-sh+3),161,95,158,101,157,"Q",126,172,151,157,
  "C",157,158,f(c+sh-3),161,f(c+sh),169,
  "C",f(c+sh+5),190,f(c+bust+8),210,f(c+bust),233,
  "C",f(c+bust-1),257,f(c+waist+6),278,f(c+waist),f(wy),
  "L",f(c+waist),f(wy+23)
 ].join(" ");
 const pelvis=[
  "M",f(c-waist-2),f(wy-8),
  "C",f(c-waist-15),f(wy+16),f(c-hips-4),f(wy+39),f(c-hips),f(wy+66),
  "C",f(c-hips+1),f(wy+83),f(c-hips+8),f(wy+101),f(c-hips+24),f(wy+105),
  "L",111,f(wy+96),"Q",126,f(wy+122),141,f(wy+96),"L",f(c+hips-24),f(wy+105),
  "C",f(c+hips-8),f(wy+101),f(c+hips-1),f(wy+83),f(c+hips),f(wy+66),
  "C",f(c+hips+4),f(wy+39),f(c+waist+15),f(wy+16),f(c+waist+2),f(wy-8),"Z"
 ].join(" ");
 const pelvisLine=[
  "M",f(c-waist-2),f(wy+3),
  "C",f(c-waist-15),f(wy+16),f(c-hips-4),f(wy+39),f(c-hips),f(wy+66),
  "C",f(c-hips+1),f(wy+83),f(c-hips+8),f(wy+101),f(c-hips+24),f(wy+105),
  "M",f(c+hips-24),f(wy+105),
  "C",f(c+hips-8),f(wy+101),f(c+hips-1),f(wy+83),f(c+hips),f(wy+66),
  "C",f(c+hips+4),f(wy+39),f(c+waist+15),f(wy+16),f(c+waist+2),f(wy+3)
 ].join(" ");
 const legX=94-(hips-64)*.29,kneeX=91-(hips-64)*.10,shinX=94-(hips-64)*.13;
 const halfThigh=29*thighWidth,upperLeg=hipY+9,halfCalf=19*calfWidth;
 const thigh=[
  "M",f(legX-halfThigh),f(upperLeg),
  "C",f(legX-halfThigh-4),f(upperLeg+41),f(kneeX-19),f(knee-39),f(kneeX-17),f(knee+8),
  "Q",f(kneeX),f(knee+20),f(kneeX+18),f(knee+8),
  "C",f(kneeX+23),f(knee-36),f(legX+halfThigh+1),f(upperLeg+37),f(legX+halfThigh),f(upperLeg),"Z"
 ].join(" ");
 const thighLine=[
  "M",f(legX-halfThigh),f(upperLeg+5),
  "C",f(legX-halfThigh-4),f(upperLeg+41),f(kneeX-19),f(knee-39),f(kneeX-17),f(knee+6),
  "M",f(kneeX+18),f(knee+6),
  "C",f(kneeX+23),f(knee-36),f(legX+halfThigh+1),f(upperLeg+37),f(legX+halfThigh),f(upperLeg+5)
 ].join(" ");
 const shin=[
  "M",f(kneeX-17),f(knee-4),
  "C",f(shinX-halfCalf-4),f(knee+39),f(shinX-halfCalf-3),f(knee+88),f(shinX-12),668,
  "L",f(shinX-13),686,"Q",f(shinX),694,f(shinX+13),686,
  "L",f(shinX+12),668,
  "C",f(shinX+halfCalf+1),f(knee+89),f(shinX+halfCalf+2),f(knee+39),f(kneeX+18),f(knee-4),"Z"
 ].join(" ");
 const shinLine=[
  "M",f(kneeX-17),f(knee+2),
  "C",f(shinX-halfCalf-4),f(knee+39),f(shinX-halfCalf-3),f(knee+88),f(shinX-12),668,
  "L",f(shinX-13),686,
  "M",f(shinX+13),686,"L",f(shinX+12),668,
  "C",f(shinX+halfCalf+1),f(knee+89),f(shinX+halfCalf+2),f(knee+39),f(kneeX+18),f(knee+2)
 ].join(" ");
 const foot=[
  "M",f(shinX-13),678,
  "C",f(shinX-16),688,f(shinX-20),703,f(shinX-22),712,
  "Q",f(shinX-19),722,f(shinX+7),720,
  "Q",f(shinX+24),718,f(shinX+24),711,
  "C",f(shinX+21),700,f(shinX+14),683,f(shinX+12),678,"Z"
 ].join(" ");
 const ua=13*armWidth,elhalf=12*armWidth;
 const upperArm=[
  "M",f(sx-6),171,
  "C",f(sx-ua-4),197,f(sx-8),220,f(el-elhalf),f(elbow-7),
  "Q",f(el),f(elbow+11),f(el+elhalf),f(elbow-5),
  "C",f(sx+ua),243,f(sx+17),206,f(sx+14),175,"Z"
 ].join(" ");
 const upperArmLine=[
  "M",f(sx-6),173,
  "C",f(sx-ua-4),197,f(sx-8),220,f(el-elhalf),f(elbow-7),
  "M",f(el+elhalf),f(elbow-5),
  "C",f(sx+ua),243,f(sx+17),206,f(sx+14),175
 ].join(" ");
 const forearm=[
  "M",f(el-elhalf),f(elbow-7),
  "C",f(el-10),f(elbow+24),f(wr-14),f(wrist-42),f(wr-10),f(wrist+1),
  "Q",f(wr),f(wrist+10),f(wr+11),f(wrist+2),
  "C",f(wr+15),f(wrist-38),f(el+elhalf+1),f(elbow+23),f(el+elhalf),f(elbow-7),"Z"
 ].join(" ");
 const forearmLine=[
  "M",f(el-elhalf),f(elbow),
  "C",f(el-10),f(elbow+24),f(wr-14),f(wrist-42),f(wr-10),f(wrist+1),
  "M",f(wr+11),f(wrist+2),
  "C",f(wr+15),f(wrist-38),f(el+elhalf+1),f(elbow+23),f(el+elhalf),f(elbow)
 ].join(" ");
 const hand=[
  "M",f(wr-10),f(wrist-3),
  "C",f(wr-14),f(wrist+9),f(wr-12),f(wrist+18),f(wr-10),f(wrist+24),
  "L",f(wr-7),f(wrist+38),
  "Q",f(wr-2),f(wrist+45),f(wr+2),f(wrist+39),
  "L",f(wr+2),f(wrist+29),
  "Q",f(wr+8),f(wrist+44),f(wr+13),f(wrist+35),
  "L",f(wr+9),f(wrist+18),
  "Q",f(wr+7),f(wrist+11),f(wr+11),f(wrist+6),
  "Q",f(wr+16),f(wrist+2),f(wr+14),f(wrist-3),"Z"
 ].join(" ");
 return {
  parts:{
   head:{fill:head,outline:head,detail:""},
   neck:{fill:neck,outline:"",detail:"M 116 154 Q 126 163 136 154"},
   torso:{fill:torso,outline:torsoLine,detail:["M",f(c-bust+8),234,"Q",f(c-bust+22),248,107,235,"M",f(c+bust-8),234,"Q",f(c+bust-22),248,145,235].join(" ")},
   pelvis:{fill:pelvis,outline:pelvisLine,detail:""},
   upper_arm:{fill:upperArm,outline:upperArmLine,detail:""},
   forearm:{fill:forearm,outline:forearmLine,detail:""},
   hand:{fill:hand,outline:hand,detail:""},
   thigh:{fill:thigh,outline:thighLine,detail:""},
   shin:{fill:shin,outline:shinLine,detail:""},
   foot:{fill:foot,outline:foot,detail:""}
  },
  anchors:[
   [126,f(140-neckLift),"턱"],[f(c-sh),169,"어깨"],[f(c+sh),169,"어깨"],
   [f(el),f(elbow),"팔꿈치"],[f(252-el),f(elbow),"팔꿈치"],
   [f(wr),f(wrist),"손목"],[f(252-wr),f(wrist),"손목"],
   [f(c-waist),f(wy),"허리"],[f(c+waist),f(wy),"허리"],
   [f(c-hips),f(wy+65),"골반"],[f(c+hips),f(wy+65),"골반"],
   [f(kneeX),f(knee),"무릎"],[f(252-kneeX),f(knee),"무릎"],
   [f(shinX),681,"발목"],[f(252-shinX),681,"발목"]
  ]
 };
};
