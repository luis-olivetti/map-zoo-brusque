
FROM node:14.15.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --prod

# Estágio 2 - Configurar o servidor web para servir a aplicação Angular
FROM nginx:alpine AS angular-app

# Copiar os arquivos construídos da etapa anterior
COPY --from=builder /app/dist/* /usr/share/nginx/html/

# Adicionar configuração personalizada para permitir roteamento no Angular
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

# Estágio 3 - Configurar o servidor JSON (usando JSON Server)
FROM node:14.15.0-alpine AS json-server

WORKDIR /json-server

COPY db.json .

EXPOSE 3000

CMD ["npx", "json-server", "--watch", "db.json", "--port", "3000"]

# Estágio 4 - Combinar os dois servidores
FROM nginx:alpine

# Copiar os arquivos da etapa Angular
COPY --from=angular-app /usr/share/nginx/html /usr/share/nginx/html

# Copiar os arquivos do servidor JSON
COPY --from=json-server /json-server /json-server

# Adicionar configuração personalizada para permitir roteamento no Angular
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
