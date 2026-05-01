"use client"

import { serviceIcons } from "@/app/lib/constants"
import { motion } from "framer-motion"
import { useLanguage } from "@/app/i18n/LanguageContext"

export default function Services(){
    const { t } = useLanguage()
    // Converte o objeto t.services em array de Entries dinamicamente
    const servicesEntries = Object.entries(t.services)
    
    return(
        <section className="min-h-screen bg-gray-900 text-white pt-15">
            <div className="max-w-6xl mx-auto px-6 py-12">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {servicesEntries.map(([key, serviceData], index) => (
                        <motion.div 
                            key={key}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y:0}}
                            transition={{
                                delay: index * 0.2
                            }}
                            className="group relative p-8 rounded-2xl
                            border border-gray-800 hover:border-emerald-400/50 transition-all duration-300"
                        >
                            <div className="absolute top-4 right-4 text-4xl font-bold
                            text-emerald-400/10 group-hover:text-emerald-500/20 transition-all">
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            <div className="mb-6 text-emerald-400 p-3 bg-emerald-400/10 rounded-lg w-fit">
                                {serviceIcons[key] || serviceIcons.fullstack}
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{serviceData.title}</h3>
                            <p className="text-gray-400 mb-6">{serviceData.description}</p>

                            <div className="flex flex-wrap gap-2">
                                {serviceData.features?.map((feature: string, idx: number) => (
                                    <span 
                                        key={idx}
                                        className="px-3 text-sm bg-emerald-500 text-gray-900 rounded-full"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            <div className="absolute bottom-0 left-0 h-1 bg-emerald-400/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" /> 
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
