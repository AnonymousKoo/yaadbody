"use client";
import Image from "next/image";
import {motion,useMotionValue,useSpring,useTransform,useScroll} from "framer-motion";
import {useRef} from "react";

export function FoodDepthHero(){
 const ref=useRef<HTMLDivElement>(null),mx=useMotionValue(0),my=useMotionValue(0);
 const x=useSpring(mx,{stiffness:75,damping:20}),y=useSpring(my,{stiffness:75,damping:20});
 const rotateY=useTransform(x,[-1,1],[-5,5]),rotateX=useTransform(y,[-1,1],[5,-5]);
 const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
 const lift=useTransform(scrollYProgress,[0,1],[32,-32]);
 const px=useTransform(x,[-1,1],[-18,18]),py=useTransform(y,[-1,1],[-12,12]);
 function move(e:React.PointerEvent<HTMLDivElement>){const r=e.currentTarget.getBoundingClientRect();mx.set(((e.clientX-r.left)/r.width-.5)*2);my.set(((e.clientY-r.top)/r.height-.5)*2)}
 function reset(){mx.set(0);my.set(0)}
 return <motion.div ref={ref} onPointerMove={move} onPointerLeave={reset} className="relative min-h-[540px] [perspective:1400px] lg:min-h-[700px]" style={{y:lift}}>
  <div className="absolute inset-[1%] rounded-[3.4rem] bg-[radial-gradient(circle_at_65%_35%,#e85b2128,transparent_25%),linear-gradient(145deg,#102d20,#07150f)] shadow-[0_50px_140px_rgba(16,45,32,.3)]"/>
  <motion.div className="absolute inset-[5%] overflow-hidden rounded-[2.8rem] [transform-style:preserve-3d]" style={{rotateX,rotateY}}>
   <motion.div className="absolute -inset-[6%]" style={{x:px,y:py,scale:1.08}}><Image src="/food/yaad-jerk-chicken.jpg" alt="YaadBody jerk chicken meal" fill priority className="object-cover saturate-[1.08] contrast-[1.03]" sizes="(max-width:1024px) 100vw,55vw"/></motion.div>
   <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,14,.34),transparent_40%,transparent_72%,rgba(5,20,14,.25)),radial-gradient(circle_at_58%_44%,transparent_25%,rgba(0,0,0,.2)_82%)]"/>
   <div className="absolute inset-0 opacity-[.14] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"/>
   <motion.div className="absolute left-[9%] top-[9%] h-24 w-24 rounded-full border border-white/35" style={{x:useTransform(x,[-1,1],[-10,10]),y:useTransform(y,[-1,1],[-7,7])}}><div className="absolute left-1/2 top-0 h-full w-px bg-white/20"/><div className="absolute left-0 top-1/2 h-px w-full bg-white/20"/><span className="absolute -bottom-6 left-0 text-[8px] font-black uppercase tracking-[.18em] text-white/70">Flavor mapped</span></motion.div>
   <motion.div className="absolute right-[8%] top-[10%] rounded-2xl border border-white/20 bg-black/25 px-4 py-3 text-white backdrop-blur-xl" style={{x:useTransform(x,[-1,1],[16,-16]),y:useTransform(y,[-1,1],[10,-10])}}><p className="text-[8px] font-black uppercase tracking-[.2em] text-[var(--warm)]">YaadBody / 01</p><p className="mt-1 text-sm font-black">Jerk Chicken</p><div className="mt-2 flex gap-1"><i className="h-1 w-8 rounded-full bg-[var(--brand)]"/><i className="h-1 w-4 rounded-full bg-[var(--warm)]"/><i className="h-1 w-2 rounded-full bg-white/50"/></div></motion.div>
   <motion.div className="absolute bottom-[10%] right-[8%] w-44 rounded-2xl border border-white/20 bg-[#07150f]/55 p-4 text-white backdrop-blur-xl" style={{x:useTransform(x,[-1,1],[22,-22]),y:useTransform(y,[-1,1],[14,-14])}}><div className="flex items-end justify-between"><span className="text-[8px] font-black uppercase tracking-[.17em] text-white/50">Experience</span><b className="text-[10px] text-[var(--warm)]">LIVE</b></div><p className="mt-2 text-lg font-black tracking-[-.04em]">Real food.<br/>Engineered ease.</p></motion.div>
   <motion.div className="absolute inset-x-[13%] bottom-[5%] h-[10%] rounded-[50%] bg-black/35 blur-2xl" style={{x:useTransform(x,[-1,1],[12,-12])}}/>
   <div className="pointer-events-none absolute inset-[3%] rounded-[2.5rem] border border-white/15"/>
   <div className="pointer-events-none absolute left-6 top-6 h-8 w-8 border-l border-t border-[var(--warm)]/70"/><div className="pointer-events-none absolute bottom-6 right-6 h-8 w-8 border-b border-r border-[var(--warm)]/70"/>
  </motion.div>
  <motion.div className="absolute bottom-1 left-0 rounded-2xl border border-white/45 bg-white/82 p-4 shadow-2xl backdrop-blur-xl" style={{x:useTransform(x,[-1,1],[-10,10]),y:useTransform(y,[-1,1],[-7,7])}}><p className="text-[8px] font-black uppercase tracking-[.2em] text-[var(--brand-deep)]">YaadBody principle</p><p className="mt-1 text-lg font-black tracking-[-.04em]">Healthy should still hit.</p></motion.div>
  <div className="absolute -right-1 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex">{[1,2,3,4].map(n=><span key={n} className={"block h-1 rounded-full "+(n===1?"w-8 bg-[var(--brand)]":"ml-auto w-4 bg-[var(--leaf-deep)]/30")}/>)}</div>
 </motion.div>
}