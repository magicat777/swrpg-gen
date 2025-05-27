#!/bin/bash
# Setup script for creating and configuring SWRPG-GEN GitHub repository

echo "=== SWRPG-GEN GitHub Repository Setup ==="
echo

# Install GitHub CLI if not present
if ! command -v gh &> /dev/null; then
    echo "Installing GitHub CLI..."
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt update
    sudo apt install gh -y
fi

# Authenticate with GitHub
echo "Authenticating with GitHub..."
gh auth login

# Create the repository
echo "Creating GitHub repository..."
gh repo create swrpg-gen \
    --public \
    --description "AI-powered Star Wars RPG story generator with Neo4j, MongoDB, Weaviate, and LocalAI" \
    --homepage "https://github.com/magicat777/swrpg-gen" \
    --clone=false

# Configure git in the project directory
cd /opt/swrpg-gen

# Set up git remote
echo "Configuring git remote..."
git remote add origin https://github.com/magicat777/swrpg-gen.git
git branch -M main

# Create comprehensive README
cat > README.md << 'EOF'
# SWRPG-GEN: Star Wars RPG Story Generator

An AI-powered tabletop RPG assistant that helps Game Masters create immersive Star Wars narratives using graph databases, vector search, and local language models.

## 🌟 Features

- **AI Story Generation**: Context-aware narrative generation with streaming responses
- **Multi-Database Integration**: Neo4j (graph), MongoDB (documents), Weaviate (vectors)
- **Local LLM**: Privacy-focused with Mistral 7B running via LocalAI
- **Web Interface**: React 18 frontend with Star Wars-themed UI
- **GPU Accelerated**: Optimized for NVIDIA GPUs (RTX 4080 tested)

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Styled Components
- **Backend**: Node.js + Express + TypeScript
- **Databases**: Neo4j, MongoDB, Weaviate
- **AI/ML**: LocalAI with Mistral 7B
- **Infrastructure**: Docker Compose with GPU support

## 📋 Prerequisites

- Ubuntu 22.04+ or compatible Linux
- Docker & Docker Compose
- NVIDIA GPU with 8GB+ VRAM (optional but recommended)
- 32GB+ RAM
- 100GB+ free disk space

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/magicat777/swrpg-gen.git
   cd swrpg-gen
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Deploy services:
   ```bash
   ./scripts/deployment/deploy.sh
   ```

4. Access the application:
   - Frontend: http://localhost:3001
   - API: http://localhost:3000

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:
- [Project Overview](docs/PROJECT_STATUS_OVERVIEW.md)
- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md)
- [Database Schemas](docs/schemas/)
- [Setup Guides](docs/)

## 🏗️ Project Status

- **Development**: 89% complete (Phase 8/13)
- **Production Ready**: Passed E2E testing
- **Current Phase**: Deployment & Source Code Integration

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- LocalAI community for the excellent local LLM runtime
- Neo4j, MongoDB, and Weaviate teams for their databases
- The Star Wars fan community

---

*May the Force be with your storytelling!*
EOF

# Create .gitignore if not exists
if [ ! -f .gitignore ]; then
    cp /opt/swrpg-gen/.gitignore .
fi

# Commit and push
echo "Committing and pushing to GitHub..."
git add .
git commit -m "Initial commit: SWRPG-GEN project structure

- Complete directory structure for all services
- Docker Compose configuration for multi-container setup
- Environment configuration templates
- Package.json files for backend and frontend
- Deployment and monitoring scripts
- Comprehensive documentation structure"

git push -u origin main

echo
echo "=== Setup Complete ==="
echo "Repository created at: https://github.com/magicat777/swrpg-gen"
echo
echo "Next steps:"
echo "1. Add source code to /opt/swrpg-gen/src/"
echo "2. Configure secrets in .env file"
echo "3. Run deployment script: ./scripts/deployment/deploy.sh"