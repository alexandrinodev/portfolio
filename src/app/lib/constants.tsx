import React from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { LuFileCode2, LuGithub, LuInstagram, LuLinkedin, LuPenTool } from 'react-icons/lu'
import { TbAutomation } from 'react-icons/tb'
import { MdHighQuality } from 'react-icons/md'

export const socialLinks = [
    {icon: <LuGithub size={20} />, href: "https://github.com/alexandrinodev"},
    {icon: <LuLinkedin size={20} />, href: "https://www.linkedin.com/in/alexandrino-alex"},
    {icon: <LuInstagram size={20} />, href: "https://www.instagram.com/oalexandrino_/"},
]

export const stats = [
    { number: "2"},
    { number: "5"},
    { number: "10"},
    { number: "500"},
]

export const menuItems = [
    {title: "Home", path: "/"},
    {title: "Serviços", path: "/services"},
    {title: "Resumo", path: "/resume"},
    {title: "Projetos", path: "/work"},
    {title: "Contato", path: "/contact"},
]

// Mapeamento de ícones para serviços dynamics (chave em t.services)
export const serviceIcons: Record<string, React.ReactNode> = {
    fullstack: <LuFileCode2 size={32} />,
    backend: <LuPenTool size={32} />,
    automation: <TbAutomation size={32} />,
    quality: <MdHighQuality size={32} />,
}

export const ExperienceTabs = [
    {title: "Experiências", id: "experiencias"},
    {title: "Educação", id: "educacao"},
    {title: "Habilidades", id: "skills"},
    {title: "Sobre mim", id: "about"},
]

export const resumeData = {
    experience: [
        {
            period: "2025 - Present",
            title: "Software Engineer",
            company: "Sidia Instituto de Ciência e Tecnologia - SIDIA",
            description: "Desenvolvimento de aplicações usando Nextjs, Javascript, Node.JS, Python, Go"
        },
        {
            period: "2022 - 2025",
            title: "Test Developer Jr.",
            company: "Sidia Instituto de Ciência e Tecnologia - SIDIA",
            description: "Testes de compatbilidade, caixa preta, regressao"
        },
    ],
    education: [
        {
            period:"2017 - 2020",
            title: "Ciência da Computação",
            institution: "UNINORTE",
            description: "Bacharelado com foco em desenvolvimento web"
        }
    ],
    skills: [
        {name: "Frontend", items: ["React", "Next.js", "TypeScript"]},
        {name: "Backend", items: ["Node.js", "Python", "Postgress", "MongoDB"]},
        {name: "DevOps", items: ["Git", "Docker", "Kubernets", "CI/CD"]},
        {name: "Soft Skills", items: ["Comunicação", "Liderança", "Trabalho em Equipe"]},
    ],
    about: {
        description: "Desenvolvedor Full Stack apaixonado por criar soluçlões inovadoras e escaláveis. Experência em desenvolivmento web moderno e práticas ágeis",
        interests: ["Open Source", "UI/UX Design", "Cloud Computing", "Machine Learning"]
    }
}

export const flags = [
    {name: "Brasil" , icon: "/flag_of_brazil.svg"},
    {name: "USA" , icon: "/flag_of_usa.svg"}
]

export const skillsData = [
    // Frontend
    { name: "HTML5", icon: "/icons/html5.svg" },
    { name: "CSS3", icon: "/icons/css3.svg" },
    { name: "Tailwind CSS", icon: "/icons/tailwind.svg" },
    { name: "React", icon: "/icons/react.svg" },
    { name: "Next.js", icon: "/icons/nextjs.svg" },
    { name: "TypeScript", icon: "/icons/typescript.svg" },

    // Backend
    { name: "Node.js", icon: "/icons/nodejs.svg" },
    { name: "Go", icon: "/icons/golang.svg" },
    { name: "Python", icon: "/icons/python.svg" },
    { name: "PostgreSQL", icon: "/icons/postgres.svg" },
    { name: "MongoDB", icon: "/icons/mongodb.svg" },
    { name: "FastAPI", icon: "/icons/fastapi.svg" },
    { name: "RabbitMQ", icon: "/icons/rabbitmq.svg" },

    // DevOps
    { name: "Selenium", icon: "/icons/selenium.svg" },
    { name: "Linux", icon: "/icons/linux.svg" },
    { name: "Electron", icon: "/icons/electron.svg" },
    { name: "Git", icon: "/icons/git.svg" },
    { name: "Docker", icon: "/icons/docker.svg" },
    { name: "Kubernetes", icon: "/icons/kubernets.svg" },
    { name: "CI/CD", icon: "/icons/cicd.svg" },
]

export const projectsData = [
    {
        number: "01",
        title: "Hardware Detection Agent",
        description: "Um agente desktop robusto que detecta componentes de hardware em tempo real e envia os dados para um dashboard centralizado.",
        image: "/projects/hardware-agent.png",
        technologies: ["Electron", "Node.js", "JavaScript", "Python"],
        demoLink: "https://seu-demo-link.com", // Opcional se for ferramenta interna
        githubLink: "https://github.com/alexandrinodev" 
    },
    {
        number: "02",
        title: "QA Automation Dashboard",
        description: "Plataforma para monitoramento de testes automatizados e valnumberação de sistema, otimizando o workflow de Quality Assurance.",
        image: "/projects/qa-dashboard.png",
        technologies: ["React", "Next.js", "MongoDB", "RabbitMQ"],
        demoLink: "https://seu-demo-link.com",
        githubLink: "https://github.com/alexandrinodev"
    },
    {
        number: "03",
        title: "Fullstack E-commerce API",
        description: "API escalável com integração de filas para processamento de pedidos e gerenciamento de estoque em tempo real.",
        image: "/projects/api-backend.png",
        technologies: ["FastAPI", "Python", "PostgreSQL", "Docker"],
        demoLink: "https://api-docs-link.com",
        githubLink: "https://github.com/alexandrinodev"
    }
];

export const contactInfo = [
    {
        icon: <Phone className='w-2 h-6'/>,
        title: "Phone",
        content: "(92) 98449-4933",
        bg: "bg-emerald-400/10"
    },
    {
        icon: <Mail className='w-2 h-6'/>,
        title: "Email",
        content: "alexbrunoalexandrino@gmail.com",
        bg: "bg-emerald-400/10"
    },
    {
        icon: <MapPin className='w-2 h-6'/>,
        title: "Address",
        content: "Manaus - AM",
        bg: "bg-emerald-400/10"
    },
]