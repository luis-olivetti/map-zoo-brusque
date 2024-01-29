FROM node:14.21.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:alpine AS angular-app
COPY --from=builder /app/dist/* /usr/share/nginx/html/
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]