/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: "node",
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
