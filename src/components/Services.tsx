"use client"

import { serviceIcons } from "@/app/lib/constants"
import { motion } from "framer-motion"
import { useLanguage } from "@/app/i18n/LanguageContext"

export default function Services(){
    const { t } = useLanguage()
    // Converte o objeto t.services em array de Entries dinamicamente
    const servicesEntries = Object.entries(t.services)
    
    return(
        <section className="min-h-screen bg-gray-900 text-white pt-20 relative overflow-hidden">
            {/* Gradient Background Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 -right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto px-6 pb-12 relative z-10">
                {/* Section Title with Glow */}
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-4"
                >
                    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                        {t.servicesTitle}
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-center max-w-2xl mx-auto mb-12"
                >
                    {t.servicesSubtitle}
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {servicesEntries.map(([key, serviceData], index) => (
                        <motion.div 
                            key={key}
                            initial={{opacity: 0, y: 30, scale: 0.95}}
                            whileInView={{opacity: 1, y: 0, scale: 1}}
                            viewport={{ once: true }}
                            transition={{
                                delay: index * 0.15,
                                duration: 0.5
                            }}
                            whileHover={{ y: -5 }}
                            className="group relative p-8 rounded-2xl
                            bg-gray-800/30 backdrop-blur-sm
                            border border-gray-700/30 
                            hover:border-emerald-500/50 
                            hover:bg-emerald-500/5
                            transition-all duration-300"
                        >
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300 -z-10" />

                            {/* Number Badge */}
                            <div className="absolute top-4 right-4 text-5xl font-bold
                            text-emerald-400/10 group-hover:text-emerald-500/20 transition-all">
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            {/* Icon with Animated Background */}
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="mb-6 text-emerald-400 p-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl w-fit relative"
                            >
                                {serviceIcons[key] || serviceIcons.fullstack}
                                {/* Glow effect behind icon */}
                                <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full -z-10" />
                            </motion.div>

                            <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">
                                {serviceData.title}
                            </h3>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                {serviceData.description}
                            </p>

                            {/* Features with Enhanced Styling */}
                            <div className="flex flex-wrap gap-2">
                                {serviceData.features?.map((feature: string, idx: number) => (
                                    <motion.span 
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 rounded-full font-medium"
                                    >
                                        {feature}
                                    </motion.span>
                                ))}
                            </div>

                            {/* Bottom Border Animation */}
                            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" /> 
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
