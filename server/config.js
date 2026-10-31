import path from 'path';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Auto-inject system and user tool paths on Windows to guarantee Git, agy, Node, and Ollama are resolved
if (process.platform === 'win32') {
  const extraPaths = [
    'C:\\Program Files\\nodejs',
    path.join(os.homedir(), 'AppData', 'Local', 'agy', 'bin'),
    path.join(os.homedir(), '.gemini', 'bin'),
    path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe', 'cmd'),
    'C:\\Program Files\\Git\\cmd',
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Ollama')
  ].filter(p => fs.existsSync(p));

  const currentPaths = (process.env.PATH || '').split(';').filter(Boolean);
  for (const p of extraPaths) {
    if (!currentPaths.some(cp => cp.toLowerCase() === p.toLowerCase())) {
      currentPaths.unshift(p);
    }
  }
  process.env.PATH = currentPaths.join(';');
}

const resolveAgyCli = () => {
  if (process.env.AGY_CLI_PATH) return process.env.AGY_CLI_PATH;
  const candidates = [
    path.join(os.homedir(), 'AppData', 'Local', 'agy', 'bin', 'agy.exe'),
    path.join(os.homedir(), '.gemini', 'bin', 'agy.exe'),
    'agy'
  ];
  for (const c of candidates) {
    if (c === 'agy' || fs.existsSync(c)) return c;
  }
  return 'agy';
};

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'nehairo_secure_jwt_secret_cyber_2026_superkey',
  rootDir: process.platform === 'win32' ? 'C:\\' : '/',
  homeDir: os.homedir(),
  defaultWorkspaceDir: path.join(os.homedir(), 'nehairo-projects'),
  formatHubDir: process.env.FORMAT_HUB_DIR || path.join(os.homedir(), 'OneDrive', 'Documents'),
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    defaultModel: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b',
    embedModel: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text:latest',
  },
  antigravity: {
    cliPath: resolveAgyCli(),
    defaultArgs: ['--output-format', 'stream-json', '--dangerously-skip-permissions'],
    timeoutMs: parseInt(process.env.AGY_TIMEOUT_MS || '600000', 10),
  },
  git: {
    defaultAuthorName: process.env.GIT_AUTHOR_NAME || 'NEhAIro Operator',
    defaultAuthorEmail: process.env.GIT_AUTHOR_EMAIL || 'operator@nehairo.local',
  }
};
