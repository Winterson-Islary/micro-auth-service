//@ts-nocheck
import fs from "node:fs";
import path from "node:path";
import rsaPemToJwk from "rsa-pem-to-jwk";
const privateKey = fs.readFileSync("./certs/private.pem");
const jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");
const jwk_set = [];
jwk_set.push(jwk);
const jsonData = {
	keys: jwk_set,
};

const directoryPath = "./public/.well-known";
if (!fs.existsSync(directoryPath)) {
	fs.mkdirSync(directoryPath, { recursive: true });
}

const jsonString = JSON.stringify(jsonData);

const filePath = path.join(directoryPath, "jwks.json");
try {
	fs.writeFileSync(filePath, jsonString);
} catch (error) {
	// biome-ignore lint/nursery/noConsole: <explanation>
	console.log("error converting pem to jwk", error);
}
