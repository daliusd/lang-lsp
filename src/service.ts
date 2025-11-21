import { promisify } from 'util';
import child_process from 'child_process';
import fs from 'fs';
import LRU from 'nanolru';

interface MessageContent {
  mtime: number;
  messages: Record<string, string>;
}

interface LanguageMatch {
  line: number;
  startCol: number;
  endCol: number;
  key: string;
  translation: string;
}

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const exec = promisify(child_process.exec);

const messageEnFiles = new LRU<string, string[]>({
  max: 50,
  maxAge: 5 * 60 * 1000,
});

const messagesContent = new LRU<string, MessageContent>({
  max: 50,
  maxAge: 60 * 60 * 1000,
});

export class LanguageService {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  async getMsgPaths(): Promise<string[]> {
    let msgPaths = messageEnFiles.get(this.rootPath);
    if (!msgPaths) {
      try {
        const result = await exec(`fd messages_en.json ${this.rootPath}`);
        msgPaths = result.stdout
          .split('\n')
          .filter((fn) => fn.length > 0);
        messageEnFiles.set(this.rootPath, msgPaths);
      } catch (error) {
        // fd command might not be available or no files found
        msgPaths = [];
        messageEnFiles.set(this.rootPath, msgPaths);
      }
    }
    return msgPaths;
  }

  async getMessages(msgPaths: string[]): Promise<Record<string, string>[]> {
    const messagesList: Record<string, string>[] = [];
    for (const msgFileName of msgPaths) {
      try {
        const mtime = (await stat(msgFileName)).mtimeMs;
        const info = messagesContent.get(msgFileName);

        if (info && info.mtime === mtime) {
          messagesList.push(info.messages);
        } else {
          const content = await readFile(msgFileName, { encoding: 'utf8' });
          const messages = JSON.parse(content) as Record<string, string>;
          messagesList.push(messages);
          messagesContent.set(msgFileName, { mtime, messages });
        }
      } catch (error) {
        // Skip files that can't be read or parsed
        continue;
      }
    }
    return messagesList;
  }

  async findLanguageStrings(text: string): Promise<LanguageMatch[]> {
    const msgPaths = await this.getMsgPaths();

    if (!msgPaths || msgPaths.length === 0) {
      return [];
    }

    const messagesList = await this.getMessages(msgPaths);
    const matches: LanguageMatch[] = [];

    for (const [lineNo, line] of text.split('\n').entries()) {
      for (const m of line.matchAll(/["']([\w\.\-]*)["']/g)) {
        const key = m[1];

        if (m.index !== undefined && key.length > 0) {
          for (const messages of messagesList) {
            if (messages[key]) {
              matches.push({
                line: lineNo,
                startCol: m.index + 1, // +1 to skip opening quote
                endCol: m.index + key.length + 1,
                key,
                translation: messages[key],
              });
              break; // Only add the first match for each key
            }
          }
        }
      }
    }

    return matches;
  }

  async getTranslation(text: string, line: number, character: number): Promise<string | null> {
    const msgPaths = await this.getMsgPaths();

    if (!msgPaths || msgPaths.length === 0) {
      return null;
    }

    const messagesList = await this.getMessages(msgPaths);
    const lines = text.split('\n');
    
    if (line >= lines.length) {
      return null;
    }

    const currentLine = lines[line];
    
    // Find all matches in the current line
    for (const m of currentLine.matchAll(/["']([\w\.\-]*)["']/g)) {
      const key = m[1];
      
      if (m.index !== undefined) {
        const startCol = m.index + 1; // +1 to skip opening quote
        const endCol = m.index + key.length + 1;
        
        // Check if cursor is within the key (not on the quotes)
        if (character >= startCol && character <= endCol) {
          for (const messages of messagesList) {
            if (messages[key]) {
              return messages[key];
            }
          }
        }
      }
    }

    return null;
  }
}
