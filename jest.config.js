/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: "node",
	testTimeout: 20000,
	transform: {
		"^.+.tsx?$": ["ts-jest", {}],
	},
	verbose: true,
	collectCoverage: true,
	coverageProvider: "v8",
	collectCoverageFrom: [
		"src/**/*.ts",
		"!tests/**",
		"!**/node_modules/**",
		"!src/migrations/*.ts",
	],
};
