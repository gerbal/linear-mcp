# Linear MCP Server

> Note: This is a custom implementation. For the official Cline Linear MCP server, see [cline/linear-mcp](https://github.com/cline/linear-mcp).

A [Model Context Protocol (MCP)](https://modelcontextprotocol.github.io) server that provides tools for interacting with Linear's API, enabling AI agents to manage issues, projects, teams, and more programmatically.

## Installation

### Prerequisites
- Node.js (v16 or higher)
- A Linear account with API access
- Linear API key with appropriate permissions (get from [Linear's Developer Settings](https://linear.app/settings/api))


## Usage

### Quick Start

You need to provide your Linear API key to the server.

**Option 1: Command Line Argument**
```bash
LINEAR_API_KEY=your-api-key npx @gmclend/linear-mcp
```

**Option 2: Environment Variable**
```bash
export LINEAR_API_KEY=your-api-key
# Then run the server
npx @gmclend/linear-mcp
```

### Client Configuration

Configure your MCP client (e.g., in its settings file) to connect to this server:

```json
{
  "mcpServers": {
    "linear-mcp": {
      "command": "npx",
      "args": ["-y", "@gmclend/linear-mcp"],
      "env": {
        "LINEAR_API_KEY": "your-api-key-here",
        // Optional: Enable read-only mode (see below)
        "LINEAR_MCP_READ_ONLY": "false" 
      }
    }
  }
}
```

### Read-Only Mode

Run the server in read-only mode to prevent accidental modifications and limit the available tools (useful in restricted environments). Set the `LINEAR_MCP_READ_ONLY` environment variable:

```bash
LINEAR_MCP_READ_ONLY=true LINEAR_API_KEY=your-api-key npx @gmclend/linear-mcp
```

## Features

This server provides comprehensive tools for managing various Linear entities:

- **Issue Management**: Create, list (with filters), update, and search issues.
- **Comment Management**: Create, view, update, and delete comments on issues.
- **Label Management**: List, create, and update team labels.
- **Team Management**: List teams and view team details.
- **Project Management**: List projects (with filters) and view project details.
- **Cycle Management**: List, create, and update team cycles.
- **Document Management**: List, create, and update project documents.
- **User Management**: List users, get user details, and get info about the authenticated user.
- **Roadmap/Initiative Management**: List roadmaps/initiatives and get details.

## Available Tools

All tools are defined in [`src/tools/definitions.ts`](src/tools/definitions.ts).

### Read-Only Tools
(Available in both standard and read-only modes)

- `list_issues`: List issues with optional filters (team, assignee, status, priority, etc.).
- `search_issues`: Search issues using query text.
- `get_issue`: Get detailed information about a specific issue.
- `get_comment`: Get a specific comment.
- `list_labels`: List all labels in a team.
- `get_label`: Get label details.
- `list_teams`: List all teams in the workspace.
- `get_team`: Get team details.
- `list_projects`: List all projects with optional filters (see Project Filters section).
- `get_project`: Get project details.
- `list_cycles`: List all cycles in a team.
- `get_cycle`: Get cycle details.
- `list_documents`: List all documents, optionally filtered by team.
- `get_document`: Get document details.
- `list_users`: List all users in the workspace.
- `get_user`: Get detailed information about a specific user.
- `me`: Get information about the authenticated user.
- `list_roadmaps`: List all roadmaps.
- `get_roadmap`: Get roadmap details.
- `get_initiative`: Get detailed information about a specific initiative.

### Write Tools
(Only available when `LINEAR_MCP_READ_ONLY` is not `true`)

- `create_issue`: Create a new issue.
- `update_issue`: Update an existing issue (title, description, status, assignee, priority, labels).
- `create_comment`: Create a comment on an issue.
- `update_comment`: Update an existing comment.
- `delete_comment`: Delete a comment.
- `create_label`: Create a new label.
- `update_label`: Update an existing label.
- `create_cycle`: Create a new cycle.
- `update_cycle`: Update an existing cycle.
- `create_document`: Create a new document associated with a project.
- `update_document`: Update an existing document.

## Filters and Pagination

Many `list_*` tools support filtering and pagination.

### Project Filters (`list_projects`)

The `list_projects` command accepts the following filter parameters:

| Filter        | Description                                | Example                          |
|---------------|--------------------------------------------|----------------------------------|
| `first`       | Max results (default: 50)                  | `{"first": 10}`                  |
| `after`       | Cursor for forward pagination              | `{"after": "cursor_string"}`     |
| `teamId`      | Filter by team ID                          | `{"teamId": "team-uuid"}`        |
| `id`          | Filter by specific project ID(s)           | `{"id": ["proj-uuid"]}`          |
| `name`        | Filter by project name (contains)          | `{"name": "Refactor"}`           |
| `state`       | Filter by project state                    | `{"state": "started"}`           |
| `health`      | Filter by project health                   | `{"health": "onTrack"}`          |
| `priority`    | Filter by priority (0-4)                   | `{"priority": 3}`                |
| `createdAfter`| Filter by creation date (ISO 8601)       | `{"createdAfter": "2023-01-01"}` |
| `createdBefore`| Filter by creation date (ISO 8601)      | `{"createdBefore": "2024-01-01"}`|
| `updatedAfter`| Filter by update date (ISO 8601)         | `{"updatedAfter": "2023-06-01"}` |
| `updatedBefore`| Filter by update date (ISO 8601)        | `{"updatedBefore": "2024-01-01"}`|
| `orderBy`     | Sort results by field                      | `{"orderBy": "createdAt"}`       |

**Example Response (`list_projects`):**
```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      // ... other fields
      "teams": [ { "id": "team-id", "name": "Team Name", "key": "TEAM" } ]
    }
  ],
  "pagination": {
    "hasNextPage": true,
    "endCursor": "cursor-for-next-page"
  }
}
```

### Initiative Pagination (`list_initiatives`)

The `list_initiatives` tool supports pagination:

- `first`: Number of items from the beginning (default: 50).
- `last`: Number of items from the end.
- `after`: Cursor for forward pagination.
- `before`: Cursor for backward pagination.

**Example Response (`list_initiatives`):**
```json
{
  "initiatives": [ /* ... initiative data ... */ ],
  "pagination": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "startCursor": "cursor-for-first-item",
    "endCursor": "cursor-for-last-item"
  }
}
```

## Development

### Setup

1.  Clone the repository: `git clone [repository-url] && cd linear-mcp`
2.  Install dependencies: `npm install`
3.  Build the project: `npm run build`

### Running with Inspector

For local development and debugging with a web UI:
```bash
npm run inspector
```
Open [http://localhost:6274](http://localhost:6274) in your browser.

### Auto-Rebuild

For development with auto-rebuild on file changes:
```bash
npm run watch
```

## Technical Details

- Built with TypeScript, Linear SDK (`@linear/sdk`), and MCP SDK (`@modelcontextprotocol/sdk`).
- Communicates via stdio using the Model Context Protocol.
- Includes basic error handling for API keys, parameters, and Linear API issues.

## License

MIT