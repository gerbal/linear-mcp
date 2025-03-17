# Linear MCP Server

> Note: This is a custom implementation. For the official Cline Linear MCP server, see [cline/linear-mcp](https://github.com/cline/linear-mcp).

A Model Context Protocol (MCP) server that provides tools for interacting with Linear's API, enabling AI agents to manage issues, projects, and teams programmatically through the Linear platform.

## Features

- **Issue Management**

  - Create new issues with customizable properties (title, description, team, assignee, priority, labels)
  - List issues with flexible filtering options (team, assignee, status)
  - Update existing issues (title, description, status, assignee, priority)

- **Team Management**

  - List all teams in the workspace
  - Access team details including ID, name, key, and description

- **Project Management**
  - List all projects with optional team filtering
  - View project details including name, description, state, and associated teams

## Prerequisites

- Node.js (v16 or higher)
- A Linear account with API access
- Linear API key with appropriate permissions

## Quick Start

1. Get your Linear API key from [Linear's Developer Settings](https://linear.app/settings/api)

2. Run with your API key:

```bash
LINEAR_API_KEY=your-api-key npx @ibraheem4/linear-mcp
```

Or set it in your environment:

```bash
export LINEAR_API_KEY=your-api-key
npx @ibraheem4/linear-mcp
```

## Development Setup

1. Clone the repository:

```bash
git clone [repository-url]
cd linear-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Running with Inspector

For local development and debugging, you can use the MCP Inspector:

1. Install supergateway:

```bash
npm install -g supergateway
```

2. Use the included `run.sh` script:

```bash
chmod +x run.sh
LINEAR_API_KEY=your-api-key ./run.sh
```

3. Access the Inspector:
   - Open [localhost:1337](http://localhost:1337) in your browser
   - The Inspector connects via Server-Sent Events (SSE)
   - Test and debug tool calls through the Inspector interface

## Configuration

Configure the MCP server in your settings file based on your client:

### For Claude Desktop

- MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "linear-mcp": {
      "command": "node",
      "args": ["/path/to/linear-mcp/build/index.js"],
      "env": {
        "LINEAR_API_KEY": "your-api-key-here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### For VS Code Extension (Cline)

Location: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "linear-mcp": {
      "command": "node",
      "args": ["/path/to/linear-mcp/build/index.js"],
      "env": {
        "LINEAR_API_KEY": "your-api-key-here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### For Cursor ([cursor.sh](https://cursor.sh))

For Cursor, the server must be run with the full path:

```bash
node /Users/ibraheem/Projects/linear-mcp/build/index.js
```

## Available Tools

### create_issue

Creates a new issue in Linear.

```typescript
{
  title: string;          // Required: Issue title
  description?: string;   // Optional: Issue description (markdown supported)
  teamId: string;        // Required: Team ID
  assigneeId?: string;   // Optional: Assignee user ID
  priority?: number;     // Optional: Priority (0-4)
  labels?: string[];     // Optional: Label IDs to apply
}
```

### list_issues

Lists issues with optional filters.

```typescript
{
  teamId?: string;      // Optional: Filter by team ID
  assigneeId?: string;  // Optional: Filter by assignee ID
  status?: string;      // Optional: Filter by status
  first?: number;       // Optional: Number of issues to return (default: 50)
}
```

### update_issue

Updates an existing issue.

```typescript
{
  issueId: string;       // Required: Issue ID
  title?: string;        // Optional: New title
  description?: string;  // Optional: New description
  status?: string;      // Optional: New status
  assigneeId?: string;  // Optional: New assignee ID
  priority?: number;    // Optional: New priority (0-4)
  labels?: string[];   // Optional: Label IDs to apply to the issue
}
```

### list_teams

Lists all teams in the workspace. No parameters required.

### list_projects

Lists all projects with optional filtering.

```typescript
{
  teamId?: string;     // Optional: Filter by team ID
  first?: number;      // Optional: Number of projects to return (default: 50)
}
```

### get_issue

Gets detailed information about a specific issue.

```typescript
{
  issueId: string; // Required: Issue ID
}
```

### list_initiatives

Lists all initiatives (roadmap items).

```typescript
{
  first?: number;       // Optional: Number of initiatives to return (default: 50)
}
```

### get_initiative

Gets detailed information about a specific initiative.

```typescript
{
  initiativeId: string; // Required: Initiative ID
}
```

## Development

For development with auto-rebuild:

```bash
npm run watch
```

## Error Handling

The server includes comprehensive error handling for:

- Invalid API keys
- Missing required parameters
- Linear API errors
- Invalid tool requests

All errors are properly formatted and returned with descriptive messages.

## Technical Details

Built with:

- TypeScript
- Linear SDK (@linear/sdk v37.0.0)
- MCP SDK (@modelcontextprotocol/sdk v0.6.0)

The server uses stdio for communication and implements the Model Context Protocol for seamless integration with AI agents.

## License

MIT

## Linear MCP

A [Model Context Protocol (MCP)](https://modelcontextprotocol.github.io) implementation for interacting with Linear.

### Installation

```bash
npm install -g @ibraheem4/linear-mcp
```

### Usage

You will need to get a Linear API key to use this provider. You can obtain one from your Linear account settings.

Set the environment variable:

```bash
export LINEAR_API_KEY=your-api-key
```

Then run the provider:

```bash
linear-mcp
```

### Tools

This implementation provides the following tools:

- `create_issue` - Create a new issue in Linear
- `list_issues` - List issues with optional filters
- `update_issue` - Update an existing issue
- `list_teams` - List all teams in the workspace
- `list_projects` - List all projects
- `search_issues` - Search for issues using a text query
- `get_issue` - Get detailed information about a specific issue
- `list_initiatives` - List all initiatives (roadmap items)
- `get_initiative` - Get detailed information about a specific initiative

### CLI Usage

For testing and direct interaction with the Linear API, you can use the included CLI tool:

```bash
# Run from the package directory
npm run cli list-initiatives '{"first": 10}'

# Or if installed globally
linear-mcp-cli list-initiatives '{"first": 10}'
```

#### Pagination Support

The `list_initiatives` tool now supports pagination with the following parameters:

- `first` - Number of items to fetch from the beginning (default: 50)
- `last` - Number of items to fetch from the end (alternative to first)
- `after` - Cursor for forward pagination
- `before` - Cursor for backward pagination

Example of paginated requests:

```bash
# Get first page
linear-mcp-cli list-initiatives '{"first": 2}'

# Get next page using the endCursor from previous result
linear-mcp-cli list-initiatives '{"first": 2, "after": "cursor-from-previous-page"}'
```

The response includes pagination information:

```json
{
  "initiatives": [...],
  "pagination": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "startCursor": "cursor-for-first-item",
    "endCursor": "cursor-for-last-item"
  }
}
```

#### Retrieving Initiative Details

You can get detailed information about a specific initiative using the `get-initiative` command:

```bash
# Using the CLI directly
npm run cli get-initiative INITIATIVE_ID

# Or if installed globally
linear-mcp-cli get-initiative INITIATIVE_ID
```

This returns comprehensive information about the initiative, including:
- Basic details (name, description, creation date, etc.)
- Creator and owner information
- Associated projects with their teams
- And more

Example usage:
```bash
# First, list initiatives to get IDs
npm run cli list-initiatives '{"first": 2}'

# Then get details for a specific initiative
npm run cli get-initiative a567414d-c7db-481f-8b95-1951986368b2
```

#### Listing Projects

You can list projects in your workspace using the `list-projects` command:

```bash
# Get first few projects
npm run cli list-projects '{"first": 3}'

# Filter projects by team ID
npm run cli list-projects '{"teamId": "team-id", "first": 5}'
```

This returns a list of projects with details including:
- Basic information (ID, name, description)
- Current state
- Associated teams

The `teamId` filter uses Linear's `accessibleTeams` filter to show projects that are accessible to the specified team. This is useful for finding projects associated with a specific team.

**Note:** The Linear API expects team IDs to be of type `ID`. Make sure to provide valid team IDs which can be found using the `list_teams` command.

The output also includes pagination information to help navigate through large project lists:

```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      "description": "Project description...",
      "state": "started",
      "teams": [
        {
          "id": "team-id",
          "name": "Team Name",
          "key": "TEAM"
        }
      ]
    }
  ],
  "pagination": {
    "hasNextPage": true,
    "endCursor": "cursor-for-next-page"
  }
}
```

# Linear MCP Extension

This repository extends Linear's capabilities with additional filters and features.

## Testing the Project Filters

To test that the project filters are working correctly, use the automated test script:

1. Set up your Linear API key:
   ```bash
   # Option 1: Edit the .env file and add your API key
   LINEAR_API_KEY=your_api_key_here
   
   # Option 2: Export it as an environment variable
   export LINEAR_API_KEY=your_api_key_here
   
   # Option 3: Pass it directly to the run-tests.sh script
   ./run-tests.sh your_api_key_here
   ```

2. Run the tests:
   ```bash
   ./run-tests.sh
   ```

The tests will automatically:
- Verify connection to Linear API
- Test all project filter options (pagination, team, name, state, health, priority, dates, ordering)
- Provide a summary of successful and failed tests

## Available Filters for Projects

The following filters are available for the `list_projects` command:

| Filter | Description | Example |
|--------|-------------|---------|
| first | Number of results to return (default: 50) | `first=10` |
| after | Cursor for pagination | `after=cursor_string` |
| teamId | Filter by team ID | `teamId=123abc` |
| id | Filter by project ID | `id=proj123` |
| name | Filter by project name (contains) | `name=My Project` |
| state | Filter by project state | `state=completed` |
| health | Filter by project health | `health=onTrack` |
| priority | Filter by priority (0-4) | `priority=3` |
| createdAfter | Filter by creation date | `createdAfter=2023-01-01T00:00:00Z` |
| createdBefore | Filter by creation date | `createdBefore=2023-12-31T23:59:59Z` |
| updatedAfter | Filter by update date | `updatedAfter=2023-01-01T00:00:00Z` |
| updatedBefore | Filter by update date | `updatedBefore=2023-12-31T23:59:59Z` |
| orderBy | Sort results by field | `orderBy=createdAt` |

