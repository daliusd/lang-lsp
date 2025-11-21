import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  InitializeResult,
  Hover,
  MarkupKind,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { LanguageService } from './service';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

let languageService: LanguageService | null = null;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  // Get workspace root path
  const rootPath = params.rootPath || params.rootUri?.replace('file://', '') || process.cwd();
  languageService = new LanguageService(rootPath);

  const result: InitializeResult = {
    serverInfo: {
      name: 'lang-lsp',
      version: '0.1.0',
    },
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
    },
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
});

interface LangLspSettings {
  enableDiagnostics: boolean;
}

const defaultSettings: LangLspSettings = { enableDiagnostics: true };
let globalSettings: LangLspSettings = defaultSettings;

const documentSettings: Map<string, Thenable<LangLspSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    documentSettings.clear();
  } else {
    globalSettings = <LangLspSettings>(
      (change.settings.langLsp || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<LangLspSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'langLsp',
    }).then((settings) => {
      // Merge with defaults to handle empty/partial settings
      return { ...defaultSettings, ...settings };
    });
    documentSettings.set(resource, result);
  }
  return result;
}

documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

documents.onDidOpen((e) => {
  validateTextDocument(e.document);
});

documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const settings = await getDocumentSettings(textDocument.uri);

  if (!settings || !settings.enableDiagnostics || !languageService) {
    return;
  }

  const text = textDocument.getText();
  const matches = await languageService.findLanguageStrings(text);

  const diagnostics: Diagnostic[] = matches.map((match) => {
    return {
      severity: DiagnosticSeverity.Information,
      range: {
        start: { line: match.line, character: match.startCol },
        end: { line: match.line, character: match.endCol },
      },
      message: `en: ${match.translation}`,
      source: 'lang-lsp',
    };
  });

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onHover(async (params): Promise<Hover | null> => {
  if (!languageService) {
    return null;
  }

  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const text = document.getText();
  const translation = await languageService.getTranslation(
    text,
    params.position.line,
    params.position.character
  );

  if (!translation) {
    return null;
  }

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**Translation (en):**\n\n${translation}`,
    },
  };
});

documents.listen(connection);
connection.listen();
