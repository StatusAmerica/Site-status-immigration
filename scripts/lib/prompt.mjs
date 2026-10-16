/** Perguntas no terminal para os scripts de manutenção. */
import { createInterface } from "node:readline/promises";

export async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

/** Lê a senha mostrando asteriscos na tela para feedback. */
export function askHidden(question) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) return reject(new Error("Terminal sem TTY."));
    stdout.write(question);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") {
          stdin.setRawMode(false);
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
        } else {
          value += ch;
          stdout.write("*");
        }
      }
    };
    stdin.on("data", onData);
  });
}
