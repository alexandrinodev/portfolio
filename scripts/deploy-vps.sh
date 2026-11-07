#!/usr/bin/env bash
set -euo pipefail

sha="${1:?Informe o SHA do commit}"
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || exit 1
cd /opt/portfolio
exec 9>/opt/portfolio/deploy.lock
flock -w 300 9
release="/opt/portfolio/releases/$sha"
test -f /opt/portfolio/.env
docker compose version
previous=''
if [[ -f current-image ]]; then
  previous="$(cat current-image)"
fi
export PORTFOLIO_IMAGE="portfolio:$sha"
docker load -i "$release/portfolio.tar.gz"
# A configuração anterior é preservada para restaurar também mudanças no Compose.
if ! docker compose -f "$release/docker-compose.yml" up -d --wait --wait-timeout 120; then
  echo 'Nova versão falhou. Tentando restaurar a versão anterior.' >&2
  if [[ -n "$previous" && -f current-compose.yml ]]; then
    PORTFOLIO_IMAGE="$previous" docker compose -f current-compose.yml up -d --wait --wait-timeout 120
  else
    echo 'Primeiro deploy: não existe uma versão anterior registrada.' >&2
  fi
  exit 1
fi
cp "$release/docker-compose.yml" current-compose.yml
printf '%s\n' "$PORTFOLIO_IMAGE" > current-image
# Remove apenas o arquivo de transferência; as imagens ficam disponíveis para rollback.
rm -f "$release/portfolio.tar.gz"
echo "Deploy concluído: $PORTFOLIO_IMAGE"
