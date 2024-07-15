import type { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
	const entities = await connection.entityMetadatas;
	for (const entity of entities) {
		const repository = connection.getRepository(entity.name);
		await repository.clear();
	}
};
