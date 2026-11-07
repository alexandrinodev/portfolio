# Deploy automático na VPS Hostinger

O workflow `.github/workflows/deploy.yml` executa lint, os testes do chatbot e o build Docker em PRs para `master`. Pushes na `master` também enviam a imagem por SSH e atualizam o container. Um commit local só dispara deploy depois de `git push`. O disparo manual em Actions funciona na `master`.

O build usa Next.js standalone e Node.js 24; não recebe credenciais. A imagem inclui os dois documentos necessários ao chatbot. As variáveis são carregadas na execução, diretamente da VPS.

## Preparar a VPS uma vez

Requisitos: VPS Linux x86_64 (a imagem é construída no runner `ubuntu-latest`), com Bash e `flock`, Docker Engine e plugin Docker Compose v2 com suporte a `up --wait`. O usuário SSH deve poder executar Docker sem sudo e escrever em `/opt/portfolio`. Acesso ao grupo Docker equivale a acesso administrativo; use uma chave dedicada ao deploy.

No servidor, substitua `deploy` pelo usuário SSH escolhido:

```bash
sudo mkdir -p /opt/portfolio/releases
sudo chown -R deploy:deploy /opt/portfolio
sudo usermod -aG docker deploy
```

Abra uma nova sessão após alterar o grupo. Crie `/opt/portfolio/.env` a partir de `.env.example`, preencha as credenciais Gemini e Upstash e restrinja suas permissões:

```bash
chmod 600 /opt/portfolio/.env
```

Esse arquivo permanece no servidor e não é sobrescrito pelo pipeline. Para manter o chatbot desligado inicialmente, use `CHATBOT_ENABLED=false`. Para ativá-lo, configure as variáveis documentadas no README. Não envie credenciais em commits ou imagens.

Adicione a chave pública de deploy a `~/.ssh/authorized_keys` do usuário escolhido. Mantenha a chave privada nos secrets do GitHub.

## Secrets no GitHub

Em **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Valor |
|---|---|
| `VPS_HOST` | IP ou hostname da VPS, sem `https://` |
| `VPS_USER` | Usuário SSH com acesso ao Docker |
| `VPS_PORT` | Porta SSH; opcional, padrão `22` |
| `VPS_SSH_KEY` | Chave privada SSH dedicada, completa, sem senha |
| `VPS_KNOWN_HOSTS` | Linha de host verificada para o arquivo SSH `known_hosts` |

Para obter a linha do host, execute no seu computador (ajuste IP e porta):

```bash
ssh-keyscan -p 22 -H SEU_IP
```

Compare a impressão digital com a chave do servidor por um canal confiável, como o console da Hostinger, antes de cadastrar o resultado. No console, consulte por exemplo `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`. O workflow mantém a verificação de host SSH habilitada.

## Nginx e HTTPS existentes

A configuração assume Nginx instalado no host. Confira se o bloco HTTPS já existente encaminha para `http://127.0.0.1:3000`. Preserve domínio, certificado e configurações TLS. Exemplo apenas do trecho de proxy:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_read_timeout 120s;
}
```

Se alterar o Nginx, valide com `sudo nginx -t` antes de `sudo systemctl reload nginx`. Se ele roda em container, adapte a rede antes do primeiro deploy: `127.0.0.1` dentro de um container não aponta para o host. A porta 3000 deve estar livre no primeiro deploy; se outra aplicação a utiliza, ajuste o Compose e o proxy juntos.

## Primeiro deploy e operação

1. Prepare o usuário, a chave SSH e o arquivo `.env` na VPS.
2. Cadastre os secrets.
3. Faça push dos arquivos deste projeto para `master`.
4. Acompanhe **Actions → CI e deploy VPS**.
5. Confira `https://SEU_DOMINIO/pt`, `/en` e o chatbot, se ativado.

O pipeline verifica HTTP 200 em `/pt` dentro do container. Isso não verifica o certificado, DNS, Nginx nem as credenciais dos serviços do chatbot. Valide esses pontos pelo domínio após o primeiro deploy. O container só publica a porta no loopback do host.

Deploys são serializados; PRs nunca acessam os secrets de deploy. A atualização de um único container pode causar uma breve interrupção. Se a nova versão não ficar saudável, o script tenta restaurar a imagem e o Compose do último deploy bem-sucedido; o primeiro deploy ainda não possui uma versão anterior.

Logs na VPS:

```bash
docker logs --tail 100 portfolio_frontend
cat /opt/portfolio/current-image
```

Rollback manual para um SHA que já foi enviado, usando o Compose atual:

```bash
cd /opt/portfolio
PORTFOLIO_IMAGE=portfolio:SHA_ANTERIOR docker compose -f current-compose.yml up -d --wait
printf '%s\n' 'portfolio:SHA_ANTERIOR' > current-image
```

As imagens anteriores ficam no Docker para permitir rollback. Monitore o disco e remova versões antigas conforme sua retenção, preservando a atual e pelo menos uma anterior. Arquivos transferidos com sucesso são removidos; falhas podem deixar arquivos em `releases/` para diagnóstico.

A Vercel continua independente: para interromper os deploys nela, ajuste a integração Git no painel Vercel quando a VPS estiver validada. Se usar domínio próprio, aponte o DNS para a VPS conforme seu provedor.

Referências: [Next.js: deploy](https://nextjs.org/docs/app/getting-started/deploying), [GitHub Actions: secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).
