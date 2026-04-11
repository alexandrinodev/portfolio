import { FaPallet } from 'react-icons/fa'
import { LuFileCode2, LuGithub, LuInstagram, LuLinkedin, LuPenTool, LuSearch, LuYoutube } from 'react-icons/lu'

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

export const services = [
    {
        number: "01",
        icon: <LuFileCode2 size={32} />,
        title: "Desenvolvedor Web",
        description: "Criação de sites modernos, responsivos e de alta performance utilizando as tecnologias mais recentes do mercado.",
        features: ["React & Next.js", "SPAs e Landing Pages"]
    },
    {
        number: "02",
        icon: <FaPallet size={32} />,
        title: "UI/UX Design",
        description: "Desenvolvimento de interfaces intuitivas e centradas no usuário para garantir a melhor experiência de navegação.",
        features: ["Prototipagem no Figma", "Design Responsivo"]
    },
    {
        number: "03",
        icon: <LuPenTool size={32} />,
        title: "Branding & Identidade",
        description: "Criação de elementos visuais únicos que comunicam a essência da sua marca e conectam com seu público-alvo.",
        features: ["Logotipos", "Guia de Estilo"]
    },
    {
        number: "04",
        icon: <LuSearch size={32} />,
        title: "Otimização de SEO",
        description: "Aplicação de técnicas avançadas para melhorar o rankeamento do seu site nos motores de busca como o Google.",
        features: ["Core Web Vitals", "SEO On-Page"]
    },
]