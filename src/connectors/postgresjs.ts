// Importing modules with ESM syntax
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { connectorInitializationErrorMessage } from "../utils/index.js";
import { FastifyDrizzleOptions } from "../plugin.js";

export type PGJSConnectors = {
    migrationHandler: PostgresJsDatabase | undefined;
    queryHandler: PostgresJsDatabase;
};

// Convert the module export to TypeScript with type annotations and ESM syntax
export default async (opts: FastifyDrizzleOptions): Promise<PGJSConnectors> => {
    try {
        const queryClient = postgres(opts.connectionString);
        const queryHandler = drizzle<(typeof opts.drizzleConfig)["schema"]>(
            queryClient,
            opts.drizzleConfig || {}
        );
        let migrationHandler: PostgresJsDatabase | undefined = undefined;
        if (opts.migrationClient) {
            const migrationClient = postgres(opts.connectionString, { max: 1 });
            migrationHandler = drizzle<(typeof opts.migrationConfig)["schema"]>(
                migrationClient,
                opts.migrationConfig || opts.drizzleConfig || {}
            );
            return { migrationHandler, queryHandler };
        }
        return { migrationHandler, queryHandler };
    } catch (err) {
        // Assuming err is of type any since its specific structure is not detailed
        throw new Error(connectorInitializationErrorMessage(opts.connector));
    }
};
