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
