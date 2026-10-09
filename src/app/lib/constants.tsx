import React from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { LuFileCode2, LuGithub, LuInstagram, LuLinkedin, LuPenTool } from 'react-icons/lu'
import { TbAutomation } from 'react-icons/tb'
import { MdHighQuality } from 'react-icons/md'

export const socialLinks = [
    {name: "GitHub", icon: <LuGithub size={20} />, href: "https://github.com/alexandrinodev"},
    {name: "LinkedIn", icon: <LuLinkedin size={20} />, href: "https://www.linkedin.com/in/alexandrino-alex"},
    {name: "Instagram", icon: <LuInstagram size={20} />, href: "https://www.instagram.com/oalexandrino_/"},
]

export const stats = [
    { number: "5", key: "sdlc", suffix: "" },
    { number: "4", key: "applications", suffix: "" },
    { number: "60", key: "automation", suffix: "%" },
    { number: "2", key: "languages", suffix: "" },
] as const

export const menuItems = [
    {key: "home", path: "/"},
    {key: "services", path: "/services"},
    {key: "resume", path: "/resume"},
    {key: "work", path: "/work"},
    {key: "contact", path: "/contact"},
] as const

// Mapeamento de ícones para serviços dynamics (chave em t.services)
export const serviceIcons: Record<string, React.ReactNode> = {
    fullstack: <LuFileCode2 size={32} />,
    backend: <LuPenTool size={32} />,
    automation: <TbAutomation size={32} />,
    quality: <MdHighQuality size={32} />,
}

export const whatsappNumber = "5592984494933"

export const getWhatsAppLink = (message: string) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

export const contactInfo = [
    {
        icon: <Phone className='w-3 h-7'/>,
        content: "(92) 98449-4933",
        bg: "bg-emerald-400/10"
    },
    {
        icon: <Mail className='w-3 h-7'/>,
        content: "alexbrunoalexandrino@gmail.com",
        bg: "bg-emerald-400/10"
    },
    {
        icon: <MapPin className='w-3 h-7'/>,
        content: "Manaus - AM",
        bg: "bg-emerald-400/10"
    },
]