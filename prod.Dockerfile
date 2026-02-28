# Estágio de Compilação (Build)
FROM node:20-alpine as build

WORKDIR /app

# 1. Gerar package.json dinamicamente (Adicionado Express, Multer e types/node)
RUN echo '{"name":"ultrastream","version":"1.0.0","type":"module","scripts":{"build":"vite build","start":"node server.js"},"dependencies":{"react":"^18.2.0","react-dom":"^18.2.0","lucide-react":"^0.294.0","express":"^4.18.2","multer":"^1.4.5-lts.1"},"devDependencies":{"@types/react":"^18.2.0","@types/react-dom":"^18.2.0","@types/node":"^20.0.0","@vitejs/plugin-react":"^4.2.0","typescript":"^5.2.0","vite":"^5.0.0"}}' > package.json

# 2. Gerar vite.config.js
RUN echo 'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; export default defineConfig({ plugins: [react()], build: { outDir: "dist" } });' > vite.config.js

# 3. Gerar tsconfig.json
RUN echo '{"compilerOptions":{"target":"ES2020","useDefineForClassFields":true,"lib":["ES2020","DOM","DOM.Iterable"],"module":"ESNext","skipLibCheck":true,"moduleResolution":"bundler","allowImportingTsExtensions":true,"resolveJsonModule":true,"isolatedModules":true,"noEmit":true,"jsx":"react-jsx","strict":false},"include":["**/*.ts", "**/*.tsx"]}' > tsconfig.json

# 4. Instalar dependências
RUN npm install

# 5. Copiar código fonte
COPY . .

# 6. Injetar o ponto de entrada no index.html
RUN sed -i 's|</body>|<script type="module" src="/index.tsx"></script></body>|' index.html

# 7. Compilar o frontend
RUN npm run build

# --- Estágio Final (Node.js Server) ---
FROM node:20-alpine

WORKDIR /app

# Copiar server.js e package.json
COPY --from=build /app/server.js ./
COPY --from=build /app/package.json ./

# Instalar APENAS dependências de produção (express e multer)
RUN npm install --production

# Copiar o frontend compilado
COPY --from=build /app/dist ./dist

# Criar diretório de dados e uploads (para volume persistente)
RUN mkdir -p /data/uploads

EXPOSE 80

CMD ["node", "server.js"]