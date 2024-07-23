export const isValidJWT = (token: string | null): boolean => {
	if (!token) {
		return false;
	}
	const parts = token.split(".");
	if (parts.length !== 3) {
		return false;
	}
	try {
		for (const part of parts) {
			Buffer.from(part, "base64").toString("utf-8");
		}
		return true;
	} catch (_err) {
		return false;
	}
};
