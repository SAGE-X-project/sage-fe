#!/bin/bash

# SAGE Demo Agents Registration Script
# This script registers the demo agents to a local blockchain for testing

set -e

echo "========================================="
echo "   SAGE Demo Agents Registration Tool    "
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from sage-fe directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the sage-fe directory${NC}"
    exit 1
fi

# Configuration
SAGE_DIR="../sage"
MULTI_AGENT_DIR="../sage-multi-agent"
METADATA_FILE="demo-agents-metadata.json"

# Check if directories exist
if [ ! -d "$SAGE_DIR" ]; then
    echo -e "${YELLOW}Warning: SAGE directory not found at $SAGE_DIR${NC}"
    echo "Please ensure the sage repository is cloned at the same level as sage-fe"
fi

if [ ! -d "$MULTI_AGENT_DIR" ]; then
    echo -e "${YELLOW}Warning: sage-multi-agent directory not found at $MULTI_AGENT_DIR${NC}"
    echo "Please ensure the sage-multi-agent repository is cloned at the same level as sage-fe"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"
fi

if ! command_exists go; then
    echo -e "${YELLOW}⚠ Go is not installed (required for sage-multi-agent)${NC}"
else
    echo -e "${GREEN}✓ Go found:${NC} $(go version | cut -d' ' -f3)"
fi

# Option 1: Using Hardhat local network
setup_hardhat() {
    echo ""
    echo "Setting up Hardhat local blockchain..."
    
    cd "$SAGE_DIR/contracts/ethereum" 2>/dev/null || {
        echo -e "${RED}Error: Cannot navigate to SAGE contracts directory${NC}"
        echo "Please ensure SAGE is properly cloned and set up"
        exit 1
    }
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing contract dependencies..."
        npm install
    fi
    
    # Start Hardhat node in background
    echo "Starting Hardhat node..."
    npx hardhat node &
    HARDHAT_PID=$!
    sleep 5
    
    # Deploy contracts
    echo "Deploying SAGE contracts..."
    npx hardhat run scripts/deploy.js --network localhost
    
    echo -e "${GREEN}✓ Hardhat setup complete${NC}"
    echo "Contract deployed to local network"
    
    cd - > /dev/null
}

# Option 2: Generate registration commands for manual execution
generate_registration_commands() {
    echo ""
    echo "========================================="
    echo "   Manual Registration Commands          "
    echo "========================================="
    echo ""
    echo "Use these commands to register agents manually:"
    echo ""
    
    # Parse metadata file and generate commands
    echo "# Using sage-multi-agent CLI:"
    echo "cd $MULTI_AGENT_DIR"
    echo ""
    echo "# Register Root Agent"
    echo "go run cli/register/main.go \\"
    echo "  --did \"did:sage:ethereum:0x1234567890123456789012345678901234567890\" \\"
    echo "  --name \"SAGE Root Orchestrator\" \\"
    echo "  --endpoint \"http://localhost:8080\" \\"
    echo "  --public-key \"0x04a7b1f6b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1\""
    echo ""
    echo "# Register Ordering Agent"
    echo "go run cli/register/main.go \\"
    echo "  --did \"did:sage:ethereum:0x2345678901234567890123456789012345678901\" \\"
    echo "  --name \"SAGE Ordering Agent\" \\"
    echo "  --endpoint \"http://localhost:8083\" \\"
    echo "  --public-key \"0x04b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7\""
    echo ""
    echo "# Register Planning Agent"
    echo "go run cli/register/main.go \\"
    echo "  --did \"did:sage:ethereum:0x3456789012345678901234567890123456789012\" \\"
    echo "  --name \"SAGE Planning Agent\" \\"
    echo "  --endpoint \"http://localhost:8084\" \\"
    echo "  --public-key \"0x04c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8\""
    echo ""
}

# Generate key pairs for demo agents
generate_demo_keys() {
    echo ""
    echo "Generating demo key pairs..."
    
    KEYS_DIR="demo-keys"
    mkdir -p $KEYS_DIR
    
    # Generate Ed25519 keys for each agent
    for agent in root ordering planning; do
        KEY_FILE="$KEYS_DIR/${agent}_agent.key"
        if [ ! -f "$KEY_FILE" ]; then
            echo "Generating key for $agent agent..."
            # This would normally use a proper key generation tool
            # For demo purposes, we're creating placeholder files
            echo "-----BEGIN PRIVATE KEY-----" > "$KEY_FILE"
            echo "# Demo private key for $agent agent" >> "$KEY_FILE"
            echo "# DO NOT USE IN PRODUCTION" >> "$KEY_FILE"
            openssl rand -base64 32 >> "$KEY_FILE"
            echo "-----END PRIVATE KEY-----" >> "$KEY_FILE"
            chmod 600 "$KEY_FILE"
            echo -e "${GREEN}✓ Generated key for $agent agent${NC}"
        else
            echo -e "${YELLOW}⚠ Key already exists for $agent agent${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Demo keys generated in $KEYS_DIR/${NC}"
    echo -e "${YELLOW}Warning: These are demo keys only. Never use in production!${NC}"
}

# Create .env file for demo
create_demo_env() {
    echo ""
    echo "Creating demo environment configuration..."
    
    ENV_FILE=".env.demo"
    
    cat > $ENV_FILE << EOF
# SAGE Demo Environment Configuration
# Generated on $(date)

# Blockchain Configuration
BLOCKCHAIN_NETWORK=local
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545

# Agent DIDs
ROOT_AGENT_DID=did:sage:ethereum:0x1234567890123456789012345678901234567890
ORDERING_AGENT_DID=did:sage:ethereum:0x2345678901234567890123456789012345678901
PLANNING_AGENT_DID=did:sage:ethereum:0x3456789012345678901234567890123456789012

# Agent Endpoints
ROOT_AGENT_URL=http://localhost:8080
ORDERING_AGENT_URL=http://localhost:8083
PLANNING_AGENT_URL=http://localhost:8084

# API Keys (for demo only)
GOOGLE_API_KEY=your_gemini_api_key_here

# SAGE Protocol
SAGE_ENABLED=true
SAGE_VERIFICATION_REQUIRED=true

# Demo Mode
DEMO_MODE=true
SKIP_BLOCKCHAIN_VERIFICATION=true
EOF

    echo -e "${GREEN}✓ Created $ENV_FILE${NC}"
    echo "Update GOOGLE_API_KEY in $ENV_FILE with your actual key"
}

# Main menu
echo ""
echo "Select registration option:"
echo "1) Setup local Hardhat blockchain (recommended for demo)"
echo "2) Generate manual registration commands"
echo "3) Generate demo keys only"
echo "4) Create demo environment file"
echo "5) Complete demo setup (all of the above)"
echo "0) Exit"
echo ""
read -p "Enter option [0-5]: " option

case $option in
    1)
        setup_hardhat
        ;;
    2)
        generate_registration_commands
        ;;
    3)
        generate_demo_keys
        ;;
    4)
        create_demo_env
        ;;
    5)
        echo "Running complete demo setup..."
        generate_demo_keys
        create_demo_env
        generate_registration_commands
        echo ""
        echo -e "${GREEN}=========================================${NC}"
        echo -e "${GREEN}   Demo Setup Complete!                  ${NC}"
        echo -e "${GREEN}=========================================${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Update GOOGLE_API_KEY in .env.demo"
        echo "2. Copy demo-keys to sage-multi-agent/keys/"
        echo "3. Start the agents using the commands above"
        echo "4. Run 'npm run dev' to start the frontend"
        ;;
    0)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "For more information, see:"
echo "- demo-agents-metadata.json for agent details"
echo "- BACKEND_INTEGRATION.md for integration guide"
echo "- TEST_GUIDE.md for testing instructions"
echo "========================================="