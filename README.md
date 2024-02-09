# Fastify Drizzle (Typescript/ESM) Plugin

Fastify plugin to conveniently use [Drizzle](https://orm.drizzle.team) across your application. Now re-written in Typescript + ESM compliant.

## What's new

What's the difference between this and [fastify-drizzle](https://github.com/trey-m/fastify-drizzle)?

-   This is a re-write/refactor using Typescript. It _currently only supports postgresjs_ and no other connector. Adding new connectors is pretty trivial, feel free to make a PR with additional connectors written in Typescript.
-   The postgresjs connector now has an option for using a migration client, in accordance with the Drizzle [docs](https://orm.drizzle.team/docs/get-started-postgresql#postgresjs).
-   Updated installation method which allows for type inference of clients decorated to the fastify instance

Please see the _acknowledgements_ section below for more details.

## Installation

```bash
npm install fastify-drizzle-ts
```

## Usage

Step 1: Add the below module declaration to an .d.ts file in your project (for eg: src/@types/index.d.ts) or add the db/dbMigrate fields to an existing declaration

```javascript
declare module "fastify" {
    export interface FastifyInstance {
        // IMPORTANT: change the name to match the queryClientAlias option below if set, otherwise, use the below
        drizzle: PGJSClient;
        // IMPORTANT: change the name to match the migrationClientAlias option below if set, otherwise, use the below
        drizzleMigrate: PGJSClient;
    }
}
```

Step 2: import, set options, and use

```javascript
import fastifyDrizzle from "fastify-drizzle-ts";

const opts = {
    connectionString: ""; // required
    connector: "postgresjs"; // required - currently only postgresjs is supported
    migrationClient: true; // optional, defaults to false
    queryClientAlias: "drizzle"; // optional, defaults to "drizzle"
    migrationClientAlias: "drizzleMigration" ; // optional, defaults to "drizzleMigration"; migrationClient needs to be set to true
};

fastify.register(fastifyDrizzle, opts, (err) => console.error(err));

fastify.get("/", (request, reply) => {
    const drizzle = fastify.drizzle; // Drizzle instance
    const migration = fastify.drizzleMigration // Drizzle migration instance
    console.log(drizzle);
    console.log(migration);
});
```

## Acknowledgments

Credits go to @trey-m, the author of the original project which this project is derived from (indirect fork): https://github.com/trey-m/fastify-drizzle.

Unfortunately, this project isn't written in Typescript and I required full type support in my application - hence the new package. Even though this is slightly more than a typescript rewrite (see below), I would not consider this a v2. 

Please use the original package if you don't require Typescript support.

## Contributing

See an opportunity to extend this package? Pull requests are encouraged! Please include test coverage.

## License

Licensed under [MIT](./LICENSE).
