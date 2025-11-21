# lang-lsp

A Language Server Protocol (LSP) server for language string collection. Shows translations from `*_en.json` files when hovering over language keys in your code.

This is the LSP version of [langd](https://github.com/daliusd/langd), providing better IDE integration.

## Features

- **Hover support**: Hover over language keys to see translations with namespace information
- **Diagnostics**: Optional info-level diagnostics showing translations inline with namespace
- **Multiple namespace support**: Works with i18next-style namespace files (e.g., `common_en.json`, `invoice_en.json`)
- **Smart caching**: File paths cached for 5 minutes, content cached for 60 minutes
- **Auto-reload**: Automatically reloads files when modified
- **Works with any LSP client**: Neovim, VS Code, Emacs, etc.

## Requirements

Install [`fd`](https://github.com/sharkdp/fd) - required to find translation files:

```bash
# Ubuntu/Debian
sudo apt install fd-find

# macOS
brew install fd

# Arch Linux
sudo pacman -S fd
```

## Installation

```bash
npm install -g @daliusd/lang-lsp
```

## Editor Integration

### Neovim (Native LSP)

Add to your Neovim config (Lua):

```lua
-- lang-lsp for translation hints
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'javascript', 'javascriptreact', 'typescript', 'typescriptreact' },
  callback = function()
    vim.lsp.start({
      name = 'lang-lsp',
      cmd = { 'lang-lsp', '--stdio' },
      root_dir = vim.fs.root(0, { 'package.json', '.git' }),
    })
  end,
})
```

**Note**: Requires Neovim 0.10+ for `vim.fs.root()`. For older versions, use:

```lua
root_dir = vim.fs.dirname(vim.fs.find({ 'package.json', '.git' }, { upward = true })[1])
```

### VS Code

Create `.vscode/settings.json`:

```json
{
  "langLsp.enableDiagnostics": true
}
```

Install a generic LSP extension or create a custom extension that launches `lang-lsp --stdio`.

### Emacs (lsp-mode)

```elisp
(add-to-list 'lsp-language-id-configuration '(typescript-mode . "typescript"))
(lsp-register-client
 (make-lsp-client :new-connection (lsp-stdio-connection "lang-lsp")
                  :major-modes '(javascript-mode typescript-mode)
                  :server-id 'lang-lsp))
```

## Configuration

The server accepts workspace configuration:

- `langLsp.enableDiagnostics` (boolean, default: true) - Enable/disable inline diagnostics

## How It Works

1. On startup, the server searches for all `*_en.json` files in your workspace using `fd`
2. Namespaces are extracted from filenames (e.g., `invoice_en.json` → `invoice` namespace)
3. File paths are cached for 5 minutes
4. File contents are cached for 60 minutes (automatically reloaded on modification)
5. When you hover over a string key like `"invoice.edit.title"`, the server looks it up in all message files
6. The translation is displayed in a hover popup with namespace information (e.g., "Translation (en, invoice): Edit Invoice")

## Namespace Support

The server supports i18next-style namespace files:

```
src/i18n/locales/
├── common_en.json      # General UI strings
├── invoice_en.json     # Invoice-specific translations
├── settings_en.json    # Settings pages
└── errors_en.json      # Error messages
```

Hover information will show: `**Translation (en, invoice):** Your translation here`

Diagnostics will show: `[invoice] en: Your translation here`

## Supported File Types

- JavaScript (`.js`)
- JavaScript React (`.jsx`)
- TypeScript (`.ts`)
- TypeScript React (`.tsx`)

## Pattern Matching

The server matches language keys in the pattern: `["']([\w\.\-]*)["']`

Examples:

- `"user.welcome"`
- `'error.not-found'`
- `"item.name"`

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch
```

## Testing

The project includes a test directory with sample files to verify LSP functionality:

### Test Files Location

```
test/
├── package.json                    # Root marker for LSP
├── fixtures/
│   ├── locales/
│   │   └── messages_en.json       # Sample translations (legacy format)
│   ├── sample.ts                   # TypeScript test file
│   ├── sample.js                   # JavaScript test file
│   └── sample.tsx                  # React/TSX test file
```

The server supports both legacy `messages_en.json` format and modern i18next namespace format (`*_en.json`).

### How to Test

1. **Link the package for local testing**:

   ```bash
   npm link
   ```

2. **Open test files in your editor**:

   ```bash
   # Using Neovim
   nvim test/fixtures/sample.ts

   # Using VS Code
   code test/fixtures/sample.ts
   ```

3. **Verify LSP is working**:
   - **Hover test**: Move your cursor over any language key (e.g., `"user.welcome"`) and hover
   - Expected: A popup showing `Translation (en): Welcome to our application!`
   - **Diagnostics test**: Look for info-level inline messages next to language keys
   - **Check LSP status**:
     - Neovim: `:LspInfo`
     - VS Code: Check status bar for LSP connection

4. **Test different scenarios**:
   - `test/fixtures/sample.ts` - TypeScript with various key patterns
   - `test/fixtures/sample.js` - JavaScript examples
   - `test/fixtures/sample.tsx` - React component examples

### Debugging

If the LSP server isn't working:

1. **Check server is running**:

   ```bash
   ps aux | grep lang-lsp
   ```

2. **View LSP logs** (Neovim):

   ```vim
   :lua vim.cmd('e ' .. vim.lsp.get_log_path())
   ```

3. **Verify `fd` is installed**:

   ```bash
   fd --version
   ```

4. **Check messages_en.json is found**:
   ```bash
   cd test && fd messages_en.json
   ```

### Expected Behavior

When hovering over these keys in test files, you should see:

- `"user.welcome"` → "Welcome to our application!"
- `"error.not-found"` → "The requested resource was not found"
- `"button.save"` → "Save"
- `"message.success"` → "Operation completed successfully"

## License

ISC

## Author

Dalius Dobravolskas
