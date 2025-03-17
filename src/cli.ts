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
    
    return new Promise((resolve, reject) => {
      this.responseCallbacks.set(id, (response) => {
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
            resolve(response.result);
          }
        } else if (response.error) {
          reject(new Error(response.error.message || "Unknown error"));
        } else {
          reject(new Error("Invalid response format"));
        }
      });

      const request = {
        jsonrpc: "2.0",
        id,
        method: "callTool",
        params: {
          name: toolName,
          arguments: args
        }
      };

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
    if (command === "list-initiatives") {
      let options = {};
      
      if (args[1]) {
        try {
          options = JSON.parse(args[1]);
        } catch (e) {
          console.error("Error parsing options JSON:", e);
          process.exit(1);
        }
      }
      
      const result = await client.callTool("list_initiatives", options);
      console.log(JSON.stringify(result, null, 2));
    } else if (command === "get-initiative") {
      if (!args[1]) {
        console.error("Error: Initiative ID is required");
        console.log("Example: node build/cli.js get-initiative INITIATIVE_ID");
        process.exit(1);
      }
      
      const initiativeId = args[1];
      const result = await client.callTool("get_initiative", { initiativeId });
      console.log(JSON.stringify(result, null, 2));
    } else if (command === "list-projects") {
      let options = {};
      
      if (args[1]) {
        try {
          options = JSON.parse(args[1]);
        } catch (e) {
          console.error("Error parsing options JSON:", e);
          process.exit(1);
        }
      }
      
      const result = await client.callTool("list_projects", options);
      console.log(JSON.stringify(result, null, 2));
    } else if (command === "list-teams") {
      const result = await client.callTool("list_teams", { random_string: "dummy" });
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log("Available commands:");
      console.log("  list-initiatives [options]");
      console.log("  get-initiative INITIATIVE_ID");
      console.log("  list-projects [options]");
      console.log("  list-teams");
      console.log("");
      console.log("Examples:");
      console.log('  node build/cli.js list-initiatives \'{"first": 3}\'');
      console.log('  node build/cli.js list-initiatives \'{"after": "initiative-id", "first": 3}\'');
      console.log('  node build/cli.js get-initiative initiative-id');
      console.log('  node build/cli.js list-projects \'{"first": 5}\'');
      console.log('  node build/cli.js list-projects \'{"teamId": "team-id"}\'');
      console.log('  node build/cli.js list-teams');
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error); 