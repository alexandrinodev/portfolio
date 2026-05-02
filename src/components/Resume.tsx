"use client"
import { skillsData } from '@/app/lib/constants'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { useLanguage } from '@/app/i18n/LanguageContext'
import CountUp from './CountUp'

export default function Resume() {
    const { t } = useLanguage()
    const [activateTab, SetActivateTab] = useState("experiencias")
    
    const experienceTabs = [
        { id: "experiencias", title: t.experience.experiences },
        { id: "educacao", title: t.experience.education },
        { id: "skills", title: t.experience.skills },
        { id: "about", title: t.experience.aboutMe },
    ]
    
    const renderContent = () => {
        switch(activateTab){
            case "experiencias":
                return(
                    <div className='grid md:grid-cols-2 gap-6 lg:gap-8'>
                        {t.resume.experience.map((exp, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: id * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className='group relative p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300'
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300 -z-10" />
                                
                                {/* Timeline dot with glow */}
                                <div className='absolute left-0 top-6 -translate-x-1/2'>
                                    <div className='w-3 h-3 bg-emerald-400 rounded-full relative'>
                                        <div className='absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30' />
                                    </div>
                                    <div className='w-0.5 h-full absolute left-1/2 -translate-x-1/2 top-3 bg-gradient-to-b from-emerald-400/50 to-transparent' />
                                </div>
                                
                                <span className="text-emerald-400 text-sm font-medium block mb-2">
                                    {exp.period}
                                </span>
                                <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                                    {exp.title}
                                </h3>

                                <p className='text-cyan-400 mt-1 text-sm'>{exp.company}</p>
                                <p className="text-gray-400 mt-3 leading-relaxed group-hover:text-gray-300 transition-colors">{exp.description}</p>
                                
                                {/* Bottom Border Animation */}
                                <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
                            </motion.div>
                        ))}
                    </div>
                )
            case "educacao":
                return(
                    <div className='grid md:grid-cols-2 gap-6 lg:gap-8'>
                        {t.resume.education.map((education, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: id * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className='group relative p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300'
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-emerald-500/0 group-hover:from-cyan-500/5 group-hover:to-emerald-500/5 transition-all duration-300 -z-10" />
                                
                                {/* Timeline dot with glow */}
                                <div className='absolute left-0 top-6 -translate-x-1/2'>
                                    <div className='w-3 h-3 bg-cyan-400 rounded-full relative'>
                                        <div className='absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-30' />
                                    </div>
                                    <div className='w-0.5 h-full absolute left-1/2 -translate-x-1/2 top-3 bg-gradient-to-b from-cyan-400/50 to-transparent' />
                                </div>
                                
                                <span className="text-cyan-400 text-sm font-medium block mb-2">
                                    {education.period}
                                </span>
                                <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">
                                    {education.title}
                                </h3>

                                <p className="text-emerald-400 mt-1 text-sm">{education.institution}</p>
                                <p className="text-gray-400 mt-3 leading-relaxed group-hover:text-gray-300 transition-colors">{education.description}</p>
                                
                                {/* Bottom Border Animation */}
                                <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
                            </motion.div>
                        ))}
                    </div>
                )
            case "skills":
                return(
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mt-10 lg:mt-12'>
                        {skillsData.map((skill, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8, scale: 1.05 }}
                                className="group relative p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300"
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 transition-all duration-300 -z-10" />
                                
                                <div className='flex flex-col items-center'>
                                    <Image  
                                        src={skill.icon}
                                        alt={skill.name}
                                        width={96}
                                        height={96}
                                        className='w-full h-full object-contain'
                                    />
                                    <span className="text-sm text-gray-400 mt-3 group-hover:text-emerald-400 transition-colors text-center">
                                        {skill.name}
                                    </span>
                                </div>
                                
                                {/* Bottom Border Animation */}
                                <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
                            </motion.div>
                        ))}
                    </div>
                )
            case "about":
                return(
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='grid md:grid-cols-2 gap-6 lg:gap-8'
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            className='group relative p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300'
                        >
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300 -z-10" />
                            
                            <h3 className='text-xl font-bold mb-4 group-hover:text-emerald-400 transition-colors'>{t.experience.aboutMe}</h3>
                            <p className='text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors'>{t.resume.about.description}</p>
                            
                            {/* Bottom Border Animation */}
                            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ y: -5 }}
                            className='group relative p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300'
                        >
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-emerald-500/0 group-hover:from-cyan-500/5 group-hover:to-emerald-500/5 transition-all duration-300 -z-10" />
                            
                            <h3 className='text-xl font-bold mb-4 group-hover:text-cyan-400 transition-colors'>Interesses</h3>
                            <div className='flex flex-wrap gap-2'>{t.resume.about.interests.map((interest,index) => (
                                <motion.span  
                                    key={index}
                                    whileHover={{ scale: 1.1 }}
                                    className='px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-400/30 hover:border-emerald-400/50 transition-all'
                                >
                                    {interest}
                                </motion.span>
                            ))}</div>
                            
                            {/* Bottom Border Animation */}
                            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
                        </motion.div>

                    </motion.div>
                )
            default:
                return null
        }
    }

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

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-4xl font-bold mb-8"
                        >
                            <motion.span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto]"
                                animate={{
                                    backgroundPosition: ["0% center", "100% center", "0% center"]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                {t.nav.hireMe}
                            </motion.span>
                        </motion.h2>

                        <div className='space-y-3'>
                            {experienceTabs.map((tab, index) => (
                                <motion.button
                                    key={tab.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => SetActivateTab(tab.id)}
                                    className={`w-full max-w-[350px] p-4 text-left rounded-xl transition-all duration-300 backdrop-blur-sm
                                    ${tab.id === activateTab
                                            ? "bg-cyan-500/20 text-emerald-400 border border-emerald-400/50 shadow-lg shadow-emerald-500/10"
                                            : "bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10"
                                        }`}
                                >
                                    {index === 0 ? t.experience.experiences :
                                     index === 1 ? t.experience.education :
                                     index === 2 ? t.experience.skills :
                                     t.experience.aboutMe}
                                </motion.button>
                            ))}
                        </div>

                    </div>

                    {/* Content */}
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='text-3xl md:text-4xl font-bold mb-8'
                        >
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                                {experienceTabs.find(tab => tab.id === activateTab)?.title}
                            </span>
                        </motion.h2>

                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    )
}