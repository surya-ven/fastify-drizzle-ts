"use strict";

// Load env variables

// const Fastify = require("fastify");
// const t = require("tap");
import Fastify, { FastifyPluginAsync } from "fastify";
import tap from "tap";
import type { PGJSClient } from "../src/connectors/postgresjs.js";
import { FastifyDrizzleOptions } from "../src/plugin.js";

declare module "fastify" {
    export interface FastifyInstance {
        drizzle?: PGJSClient;
        dbMigrate?: PGJSClient;
        [key: string]: any; // Allows dynamic decorations like "foo" here
    }
}

const { test, teardown } = tap;

test("index.js", async (t) => {
    await t.test("registering succeeded", async (t) => {
        t.plan(1);

        const fastify = Fastify();

        await fastify.register(import("../dist/index.js"), {
            connectionString: `${process.env.DATABASE_URL}`,
            connector: "postgresjs",
        });

        t.equal(
            typeof fastify.drizzle,
            "object",
            "fastify.drizzle should be an object"
        );

        teardown(() => fastify.close());
    });

    await t.test("registering with alias", async (t) => {
        t.plan(2);

        const fastify = Fastify();

        const { default: fastifyDrizzle } = await t.mockImport<
            typeof import("../src/index.js")
        >("../src/index.js", {
            "../lib/utils/index.js": {
                deriveConnector: async () => ({
                    session: {
                        client: {
                            end: async () => {},
                        },
                    },
                }),
            },
        });

        await fastify.register(fastifyDrizzle, {
            connectionString: `${process.env.DATABASE_URL}`,
            connector: "postgresjs",
            queryClientAlias: "foo",
        });

        t.equal(
            typeof fastify.foo,
            "object",
            "fastify.foo should be an object after registration with alias"
        );
        t.equal(
            typeof fastify.drizzle,
            "undefined",
            "fastify.drizzle should be undefined when using an alias"
        );

        teardown(() => fastify.close());
    });

    await t.test("registering failed", async (t) => {
        t.plan(1);
        console.log("Test In question");

        const fastify = Fastify();

        const { default: fastifyDrizzle } = await t.mockImport<
            typeof import("../src/index.js")
        >("../src/plugin.js", {
            // File that includes the import statement here
            "./utils/index.js": {
                deriveConnector: async (opts: any) => {
                    console.log("I am failing");
                    throw new Error();
                },
            },
        });

        await t.rejects(
            async () =>
                await fastify.register(fastifyDrizzle, {
                    connectionString: `${process.env.DATABASE_URL}`,
                    connector: "postgresjs",
                })
        );

        teardown(() => fastify.close());
    });
});
