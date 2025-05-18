#!/bin/sh

# Substituir a variável de ambiente no arquivo de configuração
sed -i "s|__API_URL__|$API_URL|g" /usr/share/nginx/html/env-config.js

# Iniciar o Nginx em primeiro plano
exec nginx -g "daemon off;"
