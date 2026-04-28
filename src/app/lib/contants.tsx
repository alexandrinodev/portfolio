import { Mail, MapPin, Phone } from 'lucide-react'
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

export const skillsData = [
    { name: "HTML5", icon: "/icons/html5.svg" },
    { name: "React", icon: "/icons/react.svg" },
    { name: "Next.js", icon: "/icons/nextjs.svg" },
    { name: "TypeScript", icon: "/icons/typescript.svg" },

    // Backend
    { name: "Node.js", icon: "/icons/nodejs.svg" },
    { name: "Python", icon: "/icons/python.svg" },
    { name: "PostgreSQL", icon: "/icons/postgres.svg" },
    { name: "MongoDB", icon: "/icons/mongodb.svg" },

    // DevOps
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