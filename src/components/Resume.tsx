"use client"
import { ExperienceTabs, resumeData, skillsData } from '@/app/lib/contants'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

export default function Resume() {

    const [activateTab, SetActivateTab] = useState("experiencias")
    const renderContent = () => {
        switch(activateTab){
            case "experiencias":
                return(
                    <div className='grid md:grid-cols-2 gap-8'>
                        {resumeData.experience.map((exp, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: id * 0.1 }}
                                className='relative pl-8 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-400 before:rounded-full'
                            >
                                <span className="text-emerald-400 text-sm font-medium">
                                    {exp.period}
                                </span>
                                <h3 className="text-xl mt-2">
                                    {exp.title}
                                </h3>

                                <p className='text-emerald-400 mt-1'>{exp.company}</p>
                                <p className="text-gray-400 mt-2">{exp.description}</p>
                            </motion.div>
                        ))}
                    </div>
                )
            case "educacao":
                return(
                    <div className='grid md:grid-cols-2 gap-8'>
                        {resumeData.education.map((education, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: id * 0.1 }}
                                className='relative pl-8 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-400 before:rounded-full'
                            >
                                <span className="text-emerald-400 text-sm font-medium">
                                    {education.period}
                                </span>
                                <h3 className="text-xl mt-2">
                                    {education.title}
                                </h3>

                                <p className="text-emerald-400 mt-1">{education.institution}</p>
                                <p className="text-gray-400 mt-2">{education.description}</p>
                            </motion.div>
                        ))}
                    </div>
                )
            case "skills":
                return(
                    <div className=' grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4
                    sm:gap-8 mt-10 lg:mt-12'>
                        {skillsData.map((skill, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{y: -5}}
                                className=" group relative bg-gray-900 p-5 rounded-xl
                                border border-gray-800 hover:border-emerald-400/50 transition-all"
                            >
                                <div className='flex flex-col items-center'>
                                    <Image 
                                        src={skill.icon}
                                        alt={skill.name}
                                        width={96}
                                        height={96}
                                        className='w-full h-full object-contain'
                                    />
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-emerald-400/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" />
                            </motion.div>
                        ))}
                    </div>
                )
            case "about":
                return(
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='grid md:grid-cols-2 gap-8'
                    >
                        <div className='bg-gray-900 p-6 rounded-xl'>
                            <h3 className='text-xl font-bold mb-4'>Sobre min</h3>
                            <p className='text-gray-400'>{resumeData.about.description}</p>
                        </div>
                        <div className='bg-gray-900 p-6 rounded-xl'>
                            <h3 className='text-xl font-bold mb-4'>Interesses</h3>
                            <div className='flex flex-wrap gap-2'>{resumeData.about.interests.map((interest,index) => (
                                <span 
                                    key={index}
                                    className='px-3 py-1 bg-gray-800 text-emerald-400 rounded-full
                                    text-sm'
                                >
                                    {interest}
                                </span>
                            ))}</div>
                        </div>

                    </motion.div>
                )
            default:
                return null
        }
    }

    return (
        <section className="min-h-screen bg-gray-950 text-white pt-10">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* sidebar */}
                    <div className=" space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold mb-8"
                        >
                            Por que me contratar?
                        </motion.h2>

                        <div className='space-y-2'>
                            {ExperienceTabs.map((tab, index) => (
                                <motion.button
                                    key={tab.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => SetActivateTab(tab.id)}
                                    className={`w-full max-w-[350px] p-4 text-left rounded-lg transition-colors 
                                    ${tab.id === activateTab
                                            ? "bg-emerald-400 text-gray-900"
                                            : "bg-gray-900 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {tab.title}
                                </motion.button>
                            ))}
                        </div>

                    </div>

                    {/* {content} */}
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='text-3xl font-bold mb-8'
                        >
                            {ExperienceTabs.find(tab => tab.id === activateTab)?.title}
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