"use client";
import Image from "next/image";
import {motion,useMotionValue,useSpring,useTransform,useScroll} from "framer-motion";
import {useRef} from "react";

export function FoodDepthHero(){
 const ref=useRef<HTMLDivElement>(null),mx=useMotionValue(0),my=useMotionValue(0);
 const x=useSpring(mx,{stiffness:55,damping:24}),y=useSpring(my,{stiffness:55,damping:24});
 const rotateY=useTransform(x,[-1,1],[-2.4,2.4]),rotateX=useTransform(y,[-1,1],[2.4,-2.4]);
 const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
 const lift=useTransform(scrollYProgress,[0,1],[20,-24]);
 const px=useTransform(x,[-1,1],[-12,12]),py=useTransform(y,[-1,1],[-8,8]);
 function move(e:React.PointerEvent<HTMLDivElement>){const r=e.currentTarget.getBoundingClientRect();mx.set(((e.clientX-r.left)/r.width-.5)*2);my.set(((e.clientY-r.top)/r.height-.5)*2)}
 function reset(){mx.set(0);my.set(0)}
 return <motion.div ref={ref} onPointerMove={move} onPointerLeave={reset} className="relative min-h-[430px] [perspective:1600px] sm:min-h-[560px] lg:min-h-[720px]" style={{y:lift}}>
  <div className="absolute inset-[2%] rounded-[2rem] sm:rounded-[3.5rem] bg-[#13291f] shadow-[0_55px_150px_rgba(31,25,16,.2)]"/>
  <motion.div className="absolute inset-[4%] overflow-hidden rounded-[1.7rem] sm:inset-[5%] sm:rounded-[3rem] [transform-style:preserve-3d]" style={{rotateX,rotateY}}>
   <motion.div className="absolute -inset-[5%]" style={{x:px,y:py,scale:1.065}}><Image src="/food/yaad-jerk-chicken.jpg" alt="YaadBody jerk chicken meal" fill priority className="object-cover saturate-[1.04] contrast-[1.02]" sizes="(max-width:1024px) 100vw,55vw"/></motion.div>
   <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.03),transparent_50%,rgba(0,0,0,.22)),radial-gradient(circle_at_58%_42%,transparent_38%,rgba(0,0,0,.14)_100%)]"/>
   <div className="absolute inset-[3%] rounded-[1.45rem] sm:rounded-[2.55rem] border border-white/15"/>
  </motion.div>
  <motion.div className="absolute bottom-[1%] left-[2%] max-w-[220px] sm:left-0 sm:max-w-[250px] rounded-[1.5rem] border border-white/50 bg-[#fffaf1]/90 px-5 py-4 shadow-[0_24px_60px_rgba(36,27,18,.14)] backdrop-blur-2xl" style={{x:useTransform(x,[-1,1],[-7,7]),y:useTransform(y,[-1,1],[-5,5])}}>
   <p className="text-[8px] font-black uppercase tracking-[.22em] text-[var(--brand-deep)]">The YaadBody standard</p>
   <p className="mt-2 text-xl font-black leading-tight tracking-[-.045em]">Healthy should<br/>still hit.</p>
  </motion.div>
  <motion.div className="absolute right-[1%] top-[9%] hidden max-w-[180px] rounded-[1.4rem] border border-white/25 bg-[#102d20]/72 px-4 py-4 text-white shadow-2xl backdrop-blur-2xl sm:block" style={{x:useTransform(x,[-1,1],[8,-8]),y:useTransform(y,[-1,1],[6,-6])}}>
   <p className="text-[8px] font-black uppercase tracking-[.2em] text-[var(--warm)]">Signature plate</p>
   <p className="mt-2 text-sm font-black">Yaad Jerk Chicken</p>
   <p className="mt-1 text-[10px] leading-4 text-white/55">Deep flavor. Balanced plate. Zero sad meal-prep energy.</p>
  </motion.div>
 </motion.div>
}