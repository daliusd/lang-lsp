# lang-lsp

A Language Server Protocol (LSP) server for language string collection. Shows translations from `messages_en.json` files when hovering over language keys in your code.

This is the LSP version of [langd](https://github.com/daliusd/langd), providing better IDE integration.

## Features

- **Hover support**: Hover over language keys to see translations
- **Diagnostics**: Optional info-level diagnostics showing translations inline
- **Smart caching**: File paths cached for 5 minutes, content cached for 60 minutes
- **Auto-reload**: Automatically reloads files when modified
- **Works with any LSP client**: Neovim, VS Code, Emacs, etc.

## Requirements

Install [`fd`](https://github.com/sharkdp/fd) - required to find `messages_en.json` files:

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
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'javascript', 'javascriptreact', 'typescript', 'typescriptreact' },
  callback = function()
    vim.lsp.start({
      name = 'lang-lsp',
      cmd = { 'lang-lsp', '--stdio' },
      root_dir = vim.fs.dirname(vim.fs.find({ 'package.json', '.git' }, { upward = true })[1]),
    })
  end,
})
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

1. On startup, the server searches for all `messages_en.json` files in your workspace using `fd`
2. File paths are cached for 5 minutes
3. File contents are cached for 60 minutes (automatically reloaded on modification)
4. When you hover over a string key like `"user.welcome"`, the server looks it up in all message files
5. The translation is displayed in a hover popup

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

## License

ISC

## Author

Dalius Dobravolskas
