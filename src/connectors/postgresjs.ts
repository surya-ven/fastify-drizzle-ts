// Importing modules with ESM syntax
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { connectorInitializationErrorMessage } from "../utils/index.js";
import { FastifyDrizzleOptions } from "../plugin.js";

export type PGJSClient = PostgresJsDatabase<Record<string, never>>;
export type PGJSConnectors = {
    migrationHandler: PGJSClient | undefined;
    queryHandler: PGJSClient;
};

// Convert the module export to TypeScript with type annotations and ESM syntax
export default async (opts: FastifyDrizzleOptions): Promise<PGJSConnectors> => {
    try {
        const queryClient = postgres(opts.connectionString);
        console.log("queryClient opts", opts);
        const queryHandler = drizzle(queryClient);
        let migrationHandler: PGJSClient | undefined = undefined;
        if (opts.migrationClient) {
            const migrationClient = postgres(opts.connectionString, { max: 1 });
            migrationHandler = drizzle(migrationClient);
            return { migrationHandler, queryHandler };
        }
        // console.log(`queryHandler: ${JSON.stringify(queryHandler)}`);
        return { migrationHandler, queryHandler };
    } catch (err) {
        // Assuming err is of type any since its specific structure is not detailed
        throw new Error(connectorInitializationErrorMessage(opts.connector));
    }
};
