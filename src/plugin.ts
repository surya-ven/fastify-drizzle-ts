import { deriveConnector } from "./utils/index.js";
import { FastifyPluginAsync } from "fastify";

const QUERY_ALIAS = "drizzle";
const MIGRATION_ALIAS = "drizzleMigration";

export interface FastifyDrizzleOptions {
    connectionString: string;
    connector: string;
    migrationClient?: boolean;
    queryClientAlias?: string;
    migrationClientAlias?: string;
    isPool?: boolean;
}

export const plugin: FastifyPluginAsync<FastifyDrizzleOptions> =
    async function (instance, opts): Promise<void> {
        try {
            const connectors = await deriveConnector(opts);
            const queryClientAlias = opts.queryClientAlias || QUERY_ALIAS;
            // instance.log.info(`connectors 2: ${JSON.stringify(connectors)}`)

            instance
                .decorate(queryClientAlias, connectors.queryHandler)
                .addHook("onClose", async (instance) => {
                    const queryClient = (instance as any)[queryClientAlias]
                        .session?.client;
                    if (queryClient && typeof queryClient.end === "function") {
                        instance.log.info(
                            `Drizzle query client is disconnecting`
                        );
                        queryClient.end();
                    }
                });

            if (!opts.migrationClient) return;
            if (!connectors?.migrationHandler) {
                throw new Error(
                    `Migration client is not available for the selected connector`
                );
            }

            const migrationClientAlias =
                opts.migrationClientAlias || MIGRATION_ALIAS;
            instance
                .decorate(migrationClientAlias, connectors.migrationHandler)
                .addHook("onClose", async (instance) => {
                    const migrationClient = (instance as any)[
                        migrationClientAlias
                    ].session?.client;
                    if (
                        migrationClient &&
                        typeof migrationClient.end === "function"
                    ) {
                        instance.log.info(
                            `Drizzle migration client is disconnecting`
                        );
                        migrationClient.end();
                    }
                });
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred";
            instance.log.error(message);
            throw new Error(message);
        }
    };
