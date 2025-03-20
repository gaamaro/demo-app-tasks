# Dockerfile

FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage de produção – serve app com nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Copia configuração padrão
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
