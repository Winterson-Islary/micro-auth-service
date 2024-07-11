import { Config } from "./config/envConfig";

const Greet = (_name: string, _age: number): void => {
	console.info("Inside Greet with PORT:", Config.PORT);
};

Greet("greta", 2);
