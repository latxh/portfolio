const crypto = require("crypto");
const fs = require("fs");
const readline = require("readline");
const path = require("path");

const SOURCE_FILE = path.join(__dirname, "protected-source.html");
const TARGET_FILE = path.join(__dirname, "protected.html");

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;

function askPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function encrypt(content, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256");

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(content, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: salt + iv + ciphertext + authTag (Web Crypto expects tag appended)
  const payload = Buffer.concat([salt, iv, encrypted, authTag]);
  return payload.toString("base64");
}

async function main() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Source file not found: ${SOURCE_FILE}`);
    console.error('Create protected-source.html with your content first.');
    process.exit(1);
  }

  const content = fs.readFileSync(SOURCE_FILE, "utf8");
  const password = await askPassword("Password: ");

  if (!password) {
    console.error("Password cannot be empty.");
    process.exit(1);
  }

  const encryptedPayload = encrypt(content, password);

  let html = fs.readFileSync(TARGET_FILE, "utf8");
  html = html.replace(
    /const ENCRYPTED_PAYLOAD = ".*";/,
    `const ENCRYPTED_PAYLOAD = "${encryptedPayload}";`
  );
  fs.writeFileSync(TARGET_FILE, html, "utf8");

  console.log(`Encrypted ${content.length} bytes into protected.html`);
}

main();
