import fp from "fastify-plugin";
import { plugin } from "./plugin.js";
import type { FastifyDrizzleOptions as _FastifyDrizzleOptions } from "./plugin.js";

export const fastifyDrizzle = fp(plugin, {
    name: "fastify-drizzle-ts",
    fastify: ">=3",
});

export default fastifyDrizzle;

declare module "fastify" {
    export interface FastifyInstance {}

    export type FastifyDrizzleOptions = _FastifyDrizzleOptions;
}
