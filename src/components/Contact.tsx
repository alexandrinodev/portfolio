"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import emailjs from "@emailjs/browser"
import {motion} from "framer-motion"
import { contactInfo } from "@/app/lib/constants"
import { Send } from "lucide-react"
import { useLanguage } from "@/app/i18n/LanguageContext"

type FormData = {
    firstName: string
    lastName: string
    email: string
    phone: string
    service: string
    message: string
}

export default function Contact(){
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {register, handleSubmit, formState, reset} = useForm<FormData>()

    const onSubmit = async(data: FormData) => {
        setIsSubmitting(true)
        try {
            await emailjs.send(
                "YOUR_SERVICE_ID",
                "YOUR_TEMPLADE_ID",
                data,
                "YOUR_PUBLIC_KEY"
            )
            reset()
            alert("Mensagem Enviada com Sucesso!")
        } catch (error) {
            console.error(error)
            alert("Erro ao enviar mensagem. Tente novamente")
        }
        setIsSubmitting(false)
    }
    
return(
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

                    {/* FORMULARIO */}
                    <motion.div
                        initial={{ opacity: 0, x: 20}}
                        animate={{ opacity: 1, x: 0}}
                        className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 p-8 rounded-2xl lg:order-1 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300"
                    >
                        <h2 className="text-3xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                                {t.nav.hireMe}
                            </span>
                        </h2>
                        <p className="text-gray-400 mb-8">{t.hero.description}</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input 
                                        {...register("firstName", {required: true})}
                                        placeholder={t.contact["first-name"]}
                                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                                        
                                    />
                                    {formState.errors.firstName && 
                                        <span className="text-red-500"> {t.contact["first-name-required"]}</span>
                                    }
                                </div>
                                <div>
                                    <input 
                                        {...register("lastName", {required: true})}
                                        placeholder={t.contact["last-name"]}
                                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                                        
                                    />
                                    {formState.errors.lastName && 
                                        <span className="text-red-500"> {t.contact["last-name-required"]}</span>
                                    }
                                </div>
                            </div>

                            <input
                                {...register("email", {required: true, pattern: /^\S+@\S+$/i})}
                                placeholder={t.contact["email-address"]}
                                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                            />

                            <input
                                {...register("phone")}
                                placeholder={t.contact["phone-number"]}
                                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                            />

                            <select
                                {...register("service")}
                                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                            >
                                <option value="">{t.contact["select-service"]}</option>
                                <option value="fullstack">{t.services.fullstack.title}</option>
                                <option value="backend">{t.services.backend.title}</option>
                                <option value="automation">{t.services.automation.title}</option>
                                <option value="quality">{t.services.quality.title}</option>
                            </select>


                            <textarea
                                {...register("message", {required: true})}
                                placeholder={t.contact["type-message"]}
                                rows={6}
                                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"

                            >
                            </textarea>

                            <motion.button
                                whileHover={{scale: 1.02, boxShadow: "0 0 30px rgba(52, 211, 153, 0.4)"}}
                                whileTap={{scale: 0.9}}
                                disabled={isSubmitting}
                                className="bg-emerald-400 text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-emerald-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? "Sending..." : `${t.contact["button-send"]}`}

                                <Send size={20}/>
                            </motion.button>
                            
                        </form>
                    </motion.div>

                    {/* INFORMAÇÕES DE CONTATO */}
                    <motion.div
                        initial={{ opacity: 0, x: 20}}
                        animate={{ opacity: 1, x: 0}}
                        className="space-y-8 order-1 lg:order-2"
                    >
                        {contactInfo.map((info, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20}}
                                animate={{ opacity: 1, x: 0}}
                                whileHover={{ y: -5 }}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300"
                            >   
                                <div className={`p-4 rounded-xl ${info.bg}`}>
                                    {info.icon}
                                </div>
                                <div>
                                    <h3 className="text-gray-400 mb-1">{index === 0 ? t.contact.phone : index === 1 ? t.contact.email : t.contact.address}</h3>
                                    <p className="text-xl group-hover:text-emerald-400 transition-colors">{info.content}</p>
                                </div>

                            </motion.div>
                        ))}
                    </motion.div>
                </div>

            </div>
        </section>
    )
}
