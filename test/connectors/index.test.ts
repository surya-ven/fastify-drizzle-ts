import Fastify from "fastify";
import tap from "tap";
import {
    missingOptionsErrorMessage,
    invalidConnectorErrorMessage,
    getAvailableConnectors,
    connectorInitializationErrorMessage,
} from "../../src/utils/index.js";

const { test, teardown } = tap;

test("connector.js", async (t) => {
    // Import the mocked module and then use it with fastify.register
    const { default: fastifyDrizzle } = await t.mockImport<
        typeof import("../../src/index.js")
    >("../../src/index.js");

    await t.test("no options passed", async (t) => {
        t.plan(1);

        const fastify = Fastify();

        const expectedErr = missingOptionsErrorMessage();

        await t.rejects(
            async () => await fastify.register(fastifyDrizzle),
            new Error(expectedErr)
        );

        teardown(() => fastify.close());
    });

    await t.test("connectionString required", async (t) => {
        t.plan(1);

        const fastify = Fastify();

        const connector = (await getAvailableConnectors())[0];
        const expectedErr = missingOptionsErrorMessage();

        await t.rejects(
            // @ts-expect-error
            async () => await fastify.register(fastifyDrizzle, { connector }),
            new Error(expectedErr)
        );

        teardown(() => fastify.close());
    });

    await t.test("connector required", async (t) => {
        t.plan(1);

        const fastify = Fastify();

        const expectedErr = missingOptionsErrorMessage();

        await t.rejects(
            async () =>
                // @ts-expect-error
                fastify.register(fastifyDrizzle, {
                    connectionString: `${process.env.DATABASE_URL}`,
                }),
            new Error(expectedErr)
        );

        teardown(() => fastify.close());
    });

    await t.test("connector must be valid", async (t) => {
        t.plan(1);

        const fastify = Fastify();

        const availableConnectors = await getAvailableConnectors();
        const connector = "foo";
        const expectedErr = await invalidConnectorErrorMessage(
            connector,
            availableConnectors
        );

        await t.rejects(
            async () =>
                await fastify.register(fastifyDrizzle, {
                    connector,
                    connectionString: `${process.env.DATABASE_URL}`,
                }),
            new Error(expectedErr)
        );

        teardown(() => fastify.close());
    });

    await t.test("connector fails to initialize", async (t) => {
        t.plan(1);

        const fastify = Fastify();

        const connector = (await getAvailableConnectors())[0];
        const expectedErr = connectorInitializationErrorMessage(connector);

        await t.rejects(
            async () =>
                await fastify.register(fastifyDrizzle, {
                    connector,
                    connectionString: "foo",
                }),
            new Error(expectedErr)
        );

        teardown(() => fastify.close());
    });
});
