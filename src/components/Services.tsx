"use client"

import { services } from "@/app/lib/contants"
import { motion } from "framer-motion"

export default function Services(){
    return(
        <section className="min-h-screen bg-gray-900 text-white pt-15">
            <div className="max-w-5xl mx-auto px-6 py-12">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {services.map((service,index) => (
                        <motion.div 
                            key={index}
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
                                {service.number}
                            </div>

                            <div className="mb-6 text-emerald-400 p-3 bg-emerald-400/10 rounded-lg w-fit">
                                {service.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                            <p className="text-gray-400 mb-6">{service.description}</p>

                            <div className="flex flex-wrap gap-2">
                                {service.features.map((feature,index) => (
                                    <span 
                                        key={index}
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