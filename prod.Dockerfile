# Estágio de Compilação (Build)
FROM node:20-alpine as build

WORKDIR /app

# 1. Gerar package.json dinamicamente
# Isso é necessário porque o projeto original usa importmaps, mas para produção
# precisamos compilar o TypeScript/React
RUN echo '{"name":"ultrastream","version":"1.0.0","type":"module","scripts":{"build":"vite build"},"dependencies":{"react":"^18.2.0","react-dom":"^18.2.0","lucide-react":"^0.294.0"},"devDependencies":{"@types/react":"^18.2.0","@types/react-dom":"^18.2.0","@vitejs/plugin-react":"^4.2.0","typescript":"^5.2.0","vite":"^5.0.0"}}' > package.json

# 2. Gerar vite.config.js
RUN echo 'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; export default defineConfig({ plugins: [react()], build: { outDir: "dist" } });' > vite.config.js

# 3. Gerar tsconfig.json
RUN echo '{"compilerOptions":{"target":"ES2020","useDefineForClassFields":true,"lib":["ES2020","DOM","DOM.Iterable"],"module":"ESNext","skipLibCheck":true,"moduleResolution":"bundler","allowImportingTsExtensions":true,"resolveJsonModule":true,"isolatedModules":true,"noEmit":true,"jsx":"react-jsx","strict":false},"include":["**/*.ts", "**/*.tsx"]}' > tsconfig.json

# 4. Instalar dependências
RUN npm install

# 5. Copiar código fonte
COPY . .

# 6. Injetar o ponto de entrada no index.html
# O index.html original não tem o script type="module" src="/index.tsx" pois usa importmap.
# Nós injetamos isso para o Vite processar o bundle.
RUN sed -i 's|</body>|<script type="module" src="/index.tsx"></script></body>|' index.html

# 7. Compilar o projeto
RUN npm run build

# Estágio de Produção (Nginx)
FROM nginx:alpine

# Copiar os arquivos compilados (pasta dist)
COPY --from=build /app/dist /usr/share/nginx/html

# Configurar Nginx para SPA (Single Page Application)
# Isso garante que se o usuário der refresh em uma rota, ele não receba 404
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]