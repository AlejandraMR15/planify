// Compila la app, la sirve localmente y crea un enlace público con Cloudflare.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { bin, install } from 'cloudflared';
import { build, preview } from 'vite';

await build({ logLevel: 'warn' });
const server = await preview();
const { port } = server.config.preview;

if (!existsSync(bin)) await install(bin);

console.log('\nCreando el enlace público…');
const tunnel = spawn(bin, ['tunnel', '--url', `http://localhost:${port}`, '--no-autoupdate']);

let shown = false;
const showLink = (chunk) => {
  const url = chunk.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)?.[0];
  if (!url || shown) return;
  shown = true;
  console.log(`\n  Comparte este enlace: ${url}\n`);
  console.log('  Funciona mientras esta consola siga abierta. Ctrl+C para cerrarlo.\n');
};
tunnel.stdout.on('data', showLink);
tunnel.stderr.on('data', showLink);

tunnel.on('exit', (code) => {
  if (!shown) console.error(`No se pudo crear el enlace (código ${code}). Revisa tu conexión a internet.`);
  process.exit(code ?? 0);
});

process.on('SIGINT', () => tunnel.kill());
