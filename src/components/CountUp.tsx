import { motion,animate, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from "react";

export default function CountUp({value, className}: {value: number, className?: string}){
    const ref = useRef(null)
    const isInView = useInView(ref)
    const count = useMotionValue(0)
    const rounded = useTransform(count, (latest) => Math.round(latest))


    useEffect(() => {
        if(isInView){
            animate(count, value, {duration: 2})
        }
    }, [count, value, isInView])

    return <motion.span ref={ref} className={className}>{rounded}</motion.span>
}