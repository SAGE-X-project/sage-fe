package main

// Demo Agents Configuration for SAGE Multi-Agent System
// This file can be copied to sage-multi-agent for agent registration

import (
	"encoding/json"
	"fmt"
)

// AgentMetadata represents the metadata for an agent
type AgentMetadata struct {
	Name         string                 `json:"name"`
	DID          string                 `json:"did"`
	Description  string                 `json:"description"`
	Version      string                 `json:"version"`
	Type         string                 `json:"type"`
	Endpoint     string                 `json:"endpoint"`
	PublicKey    string                 `json:"publicKey"`
	Capabilities map[string]interface{} `json:"capabilities"`
	SAGE         SAGEConfig            `json:"sage"`
}

// SAGEConfig represents SAGE protocol configuration
type SAGEConfig struct {
	ProtocolVersion      string `json:"protocolVersion"`
	SignatureAlgorithm   string `json:"signatureAlgorithm"`
	VerificationMethod   string `json:"verificationMethod"`
	RequiredVerification bool   `json:"requiredVerification,omitempty"`
}

// GetDemoAgents returns the demo agent configurations
func GetDemoAgents() []AgentMetadata {
	return []AgentMetadata{
		{
			Name:        "SAGE Root Orchestrator",
			DID:         "did:sage:ethereum:0x1234567890123456789012345678901234567890",
			Description: "Main orchestration agent that intelligently routes tasks to specialized sub-agents",
			Version:     "1.0.0",
			Type:        "orchestrator",
			Endpoint:    "http://localhost:8080",
			PublicKey:   "0x04a7b1f6b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
			Capabilities: map[string]interface{}{
				"type": "root",
				"skills": []string{
					"task_routing",
					"agent_coordination",
					"request_analysis",
					"context_understanding",
					"multi_agent_orchestration",
				},
				"subagents":           []string{"ordering", "planning"},
				"version":             "1.0.0",
				"maxConcurrentTasks":  10,
				"supportedProtocols":  []string{"http", "https", "ws"},
				"responseFormats":     []string{"json", "text"},
			},
			SAGE: SAGEConfig{
				ProtocolVersion:    "1.0.0",
				SignatureAlgorithm: "ed25519",
				VerificationMethod: "rfc9421",
			},
		},
		{
			Name:        "SAGE Ordering Agent",
			DID:         "did:sage:ethereum:0x2345678901234567890123456789012345678901",
			Description: "Specialized agent for e-commerce orders, purchases, and shopping assistance",
			Version:     "1.0.0",
			Type:        "specialist",
			Endpoint:    "http://localhost:8083",
			PublicKey:   "0x04b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
			Capabilities: map[string]interface{}{
				"type": "ordering",
				"skills": []string{
					"order_processing",
					"purchase_management",
					"shopping_cart_management",
					"payment_processing",
					"delivery_tracking",
					"product_recommendation",
				},
				"supportedVendors": []string{
					"amazon",
					"ebay",
					"alibaba",
					"local_stores",
					"shopify",
				},
				"paymentMethods": []string{
					"credit_card",
					"debit_card",
					"paypal",
					"crypto",
					"bank_transfer",
				},
				"version":      "1.0.0",
				"maxOrderValue": 10000,
				"currencies":   []string{"USD", "EUR", "KRW", "JPY", "CNY"},
			},
			SAGE: SAGEConfig{
				ProtocolVersion:      "1.0.0",
				SignatureAlgorithm:   "ed25519",
				VerificationMethod:   "rfc9421",
				RequiredVerification: true,
			},
		},
		{
			Name:        "SAGE Planning Agent",
			DID:         "did:sage:ethereum:0x3456789012345678901234567890123456789012",
			Description: "Intelligent travel and schedule planning agent with optimization capabilities",
			Version:     "1.0.0",
			Type:        "specialist",
			Endpoint:    "http://localhost:8084",
			PublicKey:   "0x04c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
			Capabilities: map[string]interface{}{
				"type": "planning",
				"skills": []string{
					"trip_planning",
					"schedule_optimization",
					"route_planning",
					"accommodation_booking",
					"transportation_arrangement",
					"activity_recommendation",
					"budget_management",
				},
				"supportedFeatures": []string{
					"multi_destination",
					"budget_optimization",
					"time_constraints",
					"group_travel",
					"accessibility_options",
					"weather_consideration",
				},
				"dataProviders": []string{
					"google_maps",
					"booking_com",
					"tripadvisor",
					"weather_api",
					"flight_aggregators",
				},
				"version":           "1.0.0",
				"maxTripDuration":   365,
				"supportedRegions":  []string{"global"},
			},
			SAGE: SAGEConfig{
				ProtocolVersion:      "1.0.0",
				SignatureAlgorithm:   "ed25519",
				VerificationMethod:   "rfc9421",
				RequiredVerification: true,
			},
		},
	}
}

// GetDemoKeyPairs returns demo Ed25519 key pairs for testing
// WARNING: These are for demo purposes only. Never use in production!
func GetDemoKeyPairs() map[string]string {
	return map[string]string{
		"root": `-----BEGIN PRIVATE KEY-----
# Demo private key for root agent
# DO NOT USE IN PRODUCTION
MC4CAQAwBQYDK2VwBCIEIKg5QWpJC6UB2VPfFp2pLvKHe3DPLUdGLlC6z+6mJ+7h
-----END PRIVATE KEY-----`,
		"ordering": `-----BEGIN PRIVATE KEY-----
# Demo private key for ordering agent
# DO NOT USE IN PRODUCTION
MC4CAQAwBQYDK2VwBCIEIHjKl7cXtKmL3mGxqZ+5PpKH4WMhIvJJqL5A5qRm1234
-----END PRIVATE KEY-----`,
		"planning": `-----BEGIN PRIVATE KEY-----
# Demo private key for planning agent
# DO NOT USE IN PRODUCTION
MC4CAQAwBQYDK2VwBCIEIMmNPqRsTuVW3xYzK7L8N9OI5WcjKvLMqN6B6rSn5678
-----END PRIVATE KEY-----`,
	}
}

// GenerateAgentConfig generates configuration for sage-multi-agent
func GenerateAgentConfig() map[string]interface{} {
	agents := GetDemoAgents()
	config := map[string]interface{}{
		"agents": map[string]interface{}{},
		"network": map[string]interface{}{
			"chain":                "ethereum",
			"confirmation_blocks":  3,
			"gas_limit":           500000,
		},
	}

	agentsConfig := config["agents"].(map[string]interface{})
	
	for _, agent := range agents {
		agentKey := ""
		switch agent.Type {
		case "orchestrator":
			agentKey = "root"
		case "specialist":
			if capType, ok := agent.Capabilities["type"].(string); ok {
				agentKey = capType
			}
		}
		
		if agentKey != "" {
			agentsConfig[agentKey] = map[string]interface{}{
				"did":          agent.DID,
				"name":         agent.Name,
				"description":  agent.Description,
				"endpoint":     agent.Endpoint,
				"type":         agent.Type,
				"capabilities": agent.Capabilities,
				"key_file":     fmt.Sprintf("keys/%s_agent.key", agentKey),
			}
		}
	}

	return config
}

// PrintRegistrationCommands prints the CLI commands to register agents
func PrintRegistrationCommands() {
	agents := GetDemoAgents()
	
	fmt.Println("# SAGE Agent Registration Commands")
	fmt.Println("# Run these from the sage-multi-agent directory")
	fmt.Println()
	
	for _, agent := range agents {
		fmt.Printf("# Register %s\n", agent.Name)
		fmt.Printf("go run cli/register/main.go \\\n")
		fmt.Printf("  --did \"%s\" \\\n", agent.DID)
		fmt.Printf("  --name \"%s\" \\\n", agent.Name)
		fmt.Printf("  --endpoint \"%s\" \\\n", agent.Endpoint)
		fmt.Printf("  --public-key \"%s\" \\\n", agent.PublicKey)
		fmt.Printf("  --type \"%s\" \\\n", agent.Type)
		
		// Add capabilities as JSON
		capJSON, _ := json.Marshal(agent.Capabilities)
		fmt.Printf("  --capabilities '%s'\n", string(capJSON))
		fmt.Println()
	}
}

func main() {
	// Example usage
	fmt.Println("Demo Agents Configuration Generator")
	fmt.Println("====================================")
	
	// Generate and print configuration
	config := GenerateAgentConfig()
	configJSON, _ := json.MarshalIndent(config, "", "  ")
	
	fmt.Println("\n1. Agent Configuration (agent_config.yaml format):")
	fmt.Println(string(configJSON))
	
	fmt.Println("\n2. Registration Commands:")
	PrintRegistrationCommands()
	
	fmt.Println("\n3. Demo Key Pairs have been defined (DO NOT USE IN PRODUCTION)")
}