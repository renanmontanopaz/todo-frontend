# Estágio de build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Criar arquivo de configuração de ambiente para injeção em runtime
RUN echo 'window.VITE_API_URL = "__API_URL__";' > /app/public/env-config.js

# Build da aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remover configuração padrão do Nginx
RUN rm -rf ./*
RUN rm /etc/nginx/conf.d/default.conf

# Copiar build do estágio anterior
COPY --from=builder /app/dist .
COPY --from=builder /app/public/env-config.js .

# Copiar configuração personalizada do Nginx com proxy reverso
COPY nginx.conf /etc/nginx/conf.d/

# Script para substituir a variável de ambiente no runtime
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
