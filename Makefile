# Makefile – Automação completa do homelab

DEVBOX_DIR=.devbox

# 🔧 Setup inicial: instala todas as dependências via Devbox
setup:
	@echo "🔧 Instalando dependências com Devbox..."
	devbox install

# 🐳 Docker – builda todas as imagens
build:
	@echo "🐳 Buildando containers..."
	docker compose build

# 🚀 Docker – sobe tudo
up:
	@echo "🚀 Subindo ambiente com Docker..."
	docker compose up -d

# 🛑 Docker – derruba tudo
down:
	@echo "🛑 Derrubando ambiente..."
	docker compose down --remove-orphans

# 🧹 Docker – limpa tudo incluindo volumes
clean:
	@echo "🧹 Limpando tudo (containers + volumes)..."
	docker compose down -v --remove-orphans

# ♻️ Docker – limpa e sobe tudo novo
rebuild: clean build up

# 💻 Execução local sem Docker (dentro do Devbox Shell)
local:
	@echo "💻 Rodando projeto localmente (Devbox Shell)..."
	@echo "🔸 Instalando dependências frontend..."
	cd frontend && npm install
	@echo "🔸 Instalando dependências backend-node..."
	cd backend-node && npm install
	@echo "✅ Tudo pronto. Agora execute:"
	@echo "➡️  cd backend-node && npm run dev"
	@echo "➡️  cd frontend && npm start"
