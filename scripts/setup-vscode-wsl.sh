#!/bin/bash

# Setup script for VSCode Remote Development with WSL
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up VSCode for WSL Remote Development...${NC}"

# Check if VS Code is installed in Windows
echo -e "\n${YELLOW}Checking if VS Code is installed in Windows...${NC}"
if [ -f "/mnt/c/Users/magic/AppData/Local/Programs/Microsoft VS Code/bin/code" ] || [ -f "/mnt/c/Program Files/Microsoft VS Code/bin/code" ]; then
  echo -e "${GREEN}✓ VS Code is installed in Windows${NC}"
else
  echo -e "${RED}✗ VS Code not found in standard Windows locations${NC}"
  echo -e "${YELLOW}Please install VS Code in Windows if not already installed${NC}"
fi

# Create VSCode workspace file
echo -e "\n${YELLOW}Creating VSCode workspace file...${NC}"
cat > /home/magic/projects/swrpg-gen/swrpg-gen.code-workspace << 'EOF'
{
  "folders": [
    {
      "path": "."
    }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": true
    },
    "files.exclude": {
      "**/.git": true,
      "**/.DS_Store": true,
      "**/node_modules": true
    },
    "terminal.integrated.defaultProfile.linux": "bash",
    "terminal.integrated.profiles.linux": {
      "bash": {
        "path": "bash",
        "icon": "terminal-bash"
      }
    },
    "docker.host": "unix:///var/run/docker.sock",
    "remote.WSL.debug": true
  },
  "extensions": {
    "recommendations": [
      "ms-vscode-remote.remote-wsl",
      "ms-azuretools.vscode-docker",
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode",
      "mongodb.mongodb-vscode",
      "neo4j.neo4j-vscode"
    ]
  }
}
EOF

echo -e "${GREEN}✓ Created VSCode workspace file${NC}"

# Create directories for VSCode settings
echo -e "\n${YELLOW}Creating VSCode settings directory...${NC}"
mkdir -p /home/magic/.vscode-server/data/Machine
echo -e "${GREEN}✓ Created VSCode settings directory${NC}"

# Create VSCode settings
echo -e "\n${YELLOW}Creating VSCode settings...${NC}"
cat > /home/magic/.vscode-server/data/Machine/settings.json << 'EOF'
{
  "editor.fontFamily": "'Fira Code', Consolas, 'Courier New', monospace",
  "editor.fontSize": 14,
  "editor.lineHeight": 22,
  "editor.fontLigatures": true,
  "terminal.integrated.fontFamily": "'Fira Code', Consolas, 'Courier New', monospace",
  "terminal.integrated.fontSize": 14,
  "workbench.colorTheme": "Default Dark+",
  "workbench.iconTheme": "material-icon-theme",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "remote.WSL.fileWatcher.polling": true,
  "remote.WSL.fileWatcher.pollingInterval": 5000
}
EOF

echo -e "${GREEN}✓ Created VSCode settings${NC}"

# Create VS Code launch shortcut
echo -e "\n${YELLOW}Creating VS Code launch script...${NC}"
cat > /home/magic/projects/swrpg-gen/scripts/open-in-vscode.sh << 'EOF'
#!/bin/bash
code /home/magic/projects/swrpg-gen/swrpg-gen.code-workspace
EOF

chmod +x /home/magic/projects/swrpg-gen/scripts/open-in-vscode.sh
echo -e "${GREEN}✓ Created VSCode launch script${NC}"

echo -e "\n${GREEN}VSCode setup complete!${NC}"
echo -e "${YELLOW}To launch VSCode with the project, run:${NC}"
echo -e "  cd /home/magic/projects/swrpg-gen && ./scripts/open-in-vscode.sh"
echo -e "or from Windows, run:"
echo -e "  code.exe --remote wsl+Ubuntu /home/magic/projects/swrpg-gen/swrpg-gen.code-workspace"