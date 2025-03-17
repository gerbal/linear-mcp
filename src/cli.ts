#!/usr/bin/env node

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { ChildProcess, spawn } from "child_process";
import { Readable, Writable } from "stream";

// Load .env file from the project root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

const API_KEY = process.env.LINEAR_API_KEY || process.env.LINEARAPIKEY;
if (!API_KEY) {
  console.error("Error: LINEAR_API_KEY environment variable is required");
  process.exit(1);
}

// Lightweight client to call the MCP server from index.ts
class McpClient {
  private childProcess: ChildProcess;
  private requestId = 0;
  private responseCallbacks: Map<number, (response: any) => void> = new Map();
  private processedData = "";

  constructor() {
    // Spawn the index.ts as a child process
    // Use the current node executable to run the server script
    this.childProcess = spawn(
      process.execPath,
      [join(__dirname, "index.js")], 
      {
        env: { ...process.env },
        stdio: ["pipe", "pipe", "inherit"]
      }
    );

    // Handle the data from the child process
    if (this.childProcess.stdout) {
      this.childProcess.stdout.on("data", (data) => {
        this.processedData += data.toString();
        
        // Process complete messages (line by line)
        let newlineIndex;
        while ((newlineIndex = this.processedData.indexOf("\n")) !== -1) {
          const line = this.processedData.substring(0, newlineIndex);
          this.processedData = this.processedData.substring(newlineIndex + 1);
          
          try {
            const response = JSON.parse(line);
            if (response.id && this.responseCallbacks.has(response.id)) {
              const callback = this.responseCallbacks.get(response.id)!;
              callback(response);
              this.responseCallbacks.delete(response.id);
            }
          } catch (error) {
            // Ignore non-JSON responses
          }
        }
      });
    }

    // Handle errors
    this.childProcess.on("error", (error) => {
      console.error("Child process error:", error);
    });

    // Handle process exit
    this.childProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Child process exited with code ${code}`);
      }
    });
  }

  async callTool(toolName: string, args: any = {}): Promise<any> {
    const id = ++this.requestId;
    
    console.error(`Calling tool: ${toolName} with args:`, JSON.stringify(args));
    
    return new Promise((resolve, reject) => {
      this.responseCallbacks.set(id, (response) => {
        console.error(`Received response for request ${id}:`, JSON.stringify(response));
        if (response.result) {
          try {
            // Extract the actual result content from the MCP response format
            const content = response.result.content;
            if (content && content.length > 0 && content[0].type === "text") {
              resolve(JSON.parse(content[0].text));
            } else {
              resolve(response.result);
            }
          } catch (error) {
            console.error(`Error parsing response:`, error);
            resolve(response.result);
          }
        } else if (response.error) {
          console.error(`Error in response:`, response.error);
          reject(new Error(response.error.message || "Unknown error"));
        } else {
          reject(new Error("Invalid response format"));
        }
      });

      const request = {
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args
        }
      };

      console.error(`Sending request:`, JSON.stringify(request));

      if (this.childProcess.stdin) {
        this.childProcess.stdin.write(JSON.stringify(request) + "\n");
      } else {
        reject(new Error("Child process stdin is not available"));
      }
    });
  }

  async close() {
    if (this.childProcess.stdin) {
      this.childProcess.stdin.end();
    }
    return new Promise<void>((resolve) => {
      this.childProcess.on("close", () => {
        resolve();
      });
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const client = new McpClient();

  try {
    // Helper function to parse options
    const parseOptions = () => {
      let options = {};
      if (args[1]) {
        try {
          options = JSON.parse(args[1]);
        } catch (e) {
          console.error("Error parsing options JSON:", e);
          process.exit(1);
        }
      }
      return options;
    };

    // Helper function to require an ID argument
    const requireId = (name: string) => {
      if (!args[1]) {
        console.error(`Error: ${name} ID is required`);
        process.exit(1);
      }
      return args[1];
    };

    switch (command) {
      // Issue tools
      case "create-issue":
        console.log(JSON.stringify(await client.callTool("create_issue", parseOptions()), null, 2));
        break;
      case "list-issues":
        console.log(JSON.stringify(await client.callTool("list_issues", parseOptions()), null, 2));
        break;
      case "update-issue":
        console.log(JSON.stringify(await client.callTool("update_issue", parseOptions()), null, 2));
        break;
      case "get-issue":
        console.log(JSON.stringify(await client.callTool("get_issue", { issueId: requireId("Issue") }), null, 2));
        break;
      case "search-issues":
        console.log(JSON.stringify(await client.callTool("search_issues", parseOptions()), null, 2));
        break;

      // Team tools
      case "list-teams":
        console.log(JSON.stringify(await client.callTool("list_teams", {}), null, 2));
        break;

      // Project tools
      case "list-projects":
        console.log(JSON.stringify(await client.callTool("list_projects", parseOptions()), null, 2));
        break;

      // Initiative tools
      case "list-initiatives":
        console.log(JSON.stringify(await client.callTool("list_initiatives", parseOptions()), null, 2));
        break;
      case "get-initiative":
        console.log(JSON.stringify(await client.callTool("get_initiative", { initiativeId: requireId("Initiative") }), null, 2));
        break;

      // Comment tools
      case "create-comment":
        console.log(JSON.stringify(await client.callTool("create_comment", parseOptions()), null, 2));
        break;
      case "get-comment":
        console.log(JSON.stringify(await client.callTool("get_comment", { commentId: requireId("Comment") }), null, 2));
        break;
      case "update-comment":
        console.log(JSON.stringify(await client.callTool("update_comment", parseOptions()), null, 2));
        break;
      case "delete-comment":
        console.log(JSON.stringify(await client.callTool("delete_comment", { commentId: requireId("Comment") }), null, 2));
        break;

      // Label tools
      case "list-labels":
        console.log(JSON.stringify(await client.callTool("list_labels", parseOptions()), null, 2));
        break;
      case "create-label":
        console.log(JSON.stringify(await client.callTool("create_label", parseOptions()), null, 2));
        break;
      case "update-label":
        console.log(JSON.stringify(await client.callTool("update_label", parseOptions()), null, 2));
        break;

      // Cycle tools
      case "list-cycles":
        console.log(JSON.stringify(await client.callTool("list_cycles", parseOptions()), null, 2));
        break;
      case "create-cycle":
        console.log(JSON.stringify(await client.callTool("create_cycle", parseOptions()), null, 2));
        break;
      case "update-cycle":
        console.log(JSON.stringify(await client.callTool("update_cycle", parseOptions()), null, 2));
        break;

      // Document tools
      case "list-documents":
        console.log(JSON.stringify(await client.callTool("list_documents", parseOptions()), null, 2));
        break;
      case "create-document":
        console.log(JSON.stringify(await client.callTool("create_document", parseOptions()), null, 2));
        break;
      case "update-document":
        console.log(JSON.stringify(await client.callTool("update_document", parseOptions()), null, 2));
        break;

      // User tools
      case "list-users":
        console.log(JSON.stringify(await client.callTool("list_users", parseOptions()), null, 2));
        break;
      case "get-user":
        console.log(JSON.stringify(await client.callTool("get_user", { userId: requireId("User") }), null, 2));
        break;
      case "me":
        console.log(JSON.stringify(await client.callTool("me", {}), null, 2));
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.error("Available commands:");
        console.error("  - Issue tools: create-issue, list-issues, update-issue, get-issue, search-issues");
        console.error("  - Team tools: list-teams");
        console.error("  - Project tools: list-projects");
        console.error("  - Initiative tools: list-initiatives, get-initiative");
        console.error("  - Comment tools: create-comment, get-comment, update-comment, delete-comment");
        console.error("  - Label tools: list-labels, create-label, update-label");
        console.error("  - Cycle tools: list-cycles, create-cycle, update-cycle");
        console.error("  - Document tools: list-documents, create-document, update-document");
        console.error("  - User tools: list-users, get-user, me");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error); 