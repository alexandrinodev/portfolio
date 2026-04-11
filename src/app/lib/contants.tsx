import { LuGithub, LuInstagram, LuLinkedin, LuYoutube } from 'react-icons/lu'

export const socialLinks = [
    {icon: <LuGithub size={20} />, href: "link_para_github"},
    {icon: <LuLinkedin size={20} />, href: "link_para_linkeding"},
    {icon: <LuYoutube size={20} />, href: "link_para_github"},
    {icon: <LuInstagram size={20} />, href: "link_para_github"},
]

export const stats = [
    { number: "2", text: "Anos de Experiência"},
    { number: "5", text: "Projetos"},
    { number: "10", text: "Tecnologias Dominadas"},
    { number: "500", text: "Commits de Códigos"},
]

export const menuItems = [
    {title: "Home", path: "/"},
    {title: "Serviços", path: "/services"},
    {title: "Resumo", path: "/resume"},
    {title: "Projetos", path: "/work"},
    {title: "Contato", path: "/contact"},
]