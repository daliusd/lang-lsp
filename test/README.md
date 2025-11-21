# lang-lsp Test Files

This directory contains test files to verify lang-lsp functionality.

## Structure

```
test/
├── package.json                    # Root marker for LSP (required)
├── fixtures/
│   ├── locales/
│   │   └── messages_en.json       # Sample translations
│   ├── sample.ts                   # TypeScript test file
│   ├── sample.js                   # JavaScript test file
│   └── sample.tsx                  # React/TSX test file
└── README.md                       # This file
```

## Quick Start

1. **Build and link the project**:
   ```bash
   cd ..
   npm install
   npm run build
   npm link
   ```

2. **Open test files in your editor**:
   ```bash
   # Using Neovim
   nvim fixtures/sample.ts
   
   # Using VS Code  
   code fixtures/sample.ts
   ```

3. **Hover over language keys** to see translations:
   - Move cursor to `"user.welcome"` (inside the quotes)
   - Trigger hover (Neovim: `K` or `<leader>k`, VS Code: hover with mouse)
   - You should see: **Translation (en):** `Welcome to our application!`

## Test Files

### sample.ts
TypeScript file with various language key patterns:
- Variable assignments: `const msg = "user.welcome"`
- Function parameters: `displayMessage("button.save")`
- Both single and double quotes

### sample.js
JavaScript file testing:
- Object properties
- Conditional logic
- Function returns

### sample.tsx
React/TypeScript file testing:
- JSX attribute values
- Component properties
- Template strings in JSX

## Available Language Keys

The `fixtures/locales/messages_en.json` file contains:

| Key | Translation |
|-----|-------------|
| `user.welcome` | Welcome to our application! |
| `user.goodbye` | Goodbye, see you soon! |
| `user.login` | Please log in to continue |
| `user.logout` | You have been logged out |
| `error.not-found` | The requested resource was not found |
| `error.unauthorized` | You are not authorized to access this resource |
| `error.server` | An internal server error occurred |
| `button.save` | Save |
| `button.cancel` | Cancel |
| `button.submit` | Submit |
| `button.delete` | Delete |
| `message.success` | Operation completed successfully |
| `message.warning` | Please review your input |
| `message.info` | Additional information is available |

## Troubleshooting

### LSP not attaching

1. Check `:LspInfo` in Neovim or LSP status in your editor
2. Ensure `package.json` exists in the test directory (required for root detection)
3. Verify you're in a supported file type (`.ts`, `.tsx`, `.js`, `.jsx`)

### No translations showing

1. Ensure `fd` command is installed: `fd --version`
2. Check messages file is found: `fd messages_en.json`
3. Check LSP logs for errors

### Hover not working

1. Make sure cursor is **inside** the quotes, not on them
2. Pattern must match: `["']([\w\.\-]*)["']`
3. Template strings (backticks) are not currently supported

## Adding More Test Cases

To add more test cases:

1. Add new translations to `fixtures/locales/messages_en.json`
2. Use the keys in any `.ts`, `.tsx`, `.js`, or `.jsx` file
3. Hover to verify the translation appears
