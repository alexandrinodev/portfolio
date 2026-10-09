'use client'
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/app/i18n/LanguageContext";

export default function Work() {
    const { t } = useLanguage()
    const projects = t.projects

    const [currentIndex, SetCurrentIndex] = useState(0)

    const nextProject = () => {
        SetCurrentIndex((prev) => (prev + 1) % projects.length)
    }

    const prevProject = () => {
        SetCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
    }

    const project = projects[currentIndex]

return (
        <section className="min-h-screen bg-gray-950 text-white pt-20 relative overflow-hidden">
            {/* Gradient Background Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />
                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/50" />
            </div>

            {/* Floating Geometric Shapes */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 360, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-32 left-20 w-4 h-4 border border-emerald-500/30 rotate-45"
            />
            <motion.div
                animate={{ y: [0, 30, 0], rotate: [0, -360, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-32 w-3 h-3 bg-cyan-500/20 rounded-full"
            />
            <motion.div
                animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-32 left-1/3 w-2 h-2 border border-emerald-500/40 rounded-full"
            />

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 mb-4">{t.work.title}</h2>
                <p className="text-gray-400 mb-8 max-w-2xl">{t.work.subtitle}</p>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                    >

                        {/* Texto  */}
                        <div className="">
                            <div className="text-8xl font-bold text-emerald-500/20">
                                {String(currentIndex + 1).padStart(2, "0")}
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">
                                {project.title}
                            </h2>

                            <h3 className="text-sm font-semibold text-cyan-400 mb-2">{t.work.contribution}</h3>
                            <p className="text-gray-400 mb-6 leading-relaxed group-hover:text-gray-300 transition-colors">
                                {project.contribution}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {project.technologies.map((tech,index) => (
                                    <motion.span 
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 rounded-full text-sm font-medium inline-block border border-emerald-400/30 hover:border-emerald-400/50 transition-all"
                                    >
                                        {tech}
                                    </motion.span>
                                ))}
                            </div>

                        </div>

                        <div className="p-6 sm:p-8 rounded-2xl bg-gray-800/30 border border-emerald-400/30">
                            <h3 className="text-lg font-semibold text-emerald-400 mb-4">{t.work.result}</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{project.result}</p>
                        </div>

                    </motion.div>

                </AnimatePresence>
                {/* CONTROLE SLIDER */}
                <div className="flex justify-end gap-4 mt-8">
                    <motion.button
                        onClick={prevProject}
                        aria-label={t.work.previous}
                        whileHover={{scale:1.1, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)"}}
                        whileTap={{scale: 0.9}}
                        className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center
                        text-gray-900 hover:bg-emerald-300 transition-colors"
                    >
                        <ChevronLeft size={24}/>
                    </motion.button>
                    <motion.button
                        onClick={nextProject}
                        aria-label={t.work.next}
                        whileHover={{scale:1.1, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)"}}
                        whileTap={{scale: 0.9}}
                        className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center
                        text-gray-900 hover:bg-emerald-300 transition-colors"
                    >
                        <ChevronRight size={24}/>
                    </motion.button>
                    
                </div>
            </div>
        </section>
    )
}
