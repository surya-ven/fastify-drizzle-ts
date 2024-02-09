// Importing modules with ESM syntax
import path from "path";
import { promises as fs } from "fs";
import { PGJSConnectors } from "../connectors/postgresjs.js";

// Define the type for options
interface Options {
    connector: string;
    connectionString?: string;
    isPool?: boolean;
}

// Define the type for the required option structure
interface RequiredOption {
    name: keyof Options;
    type: string;
}

// Convert async functions and other functions to TypeScript with type annotations
const getAvailableConnectors = async (): Promise<string[]> => {
    const connectorsDir = path.join(
        `${process.platform === "win32" ? "" : "/"}${
            /file:\/{2,3}(.+)\/[^/]/.exec(import.meta.url)![1]
        }`,
        "../connectors"
    );
    const connectors = (await fs.readdir(connectorsDir)).map((connector) => {
        const fileName = connector.split(".")[0];
        if (!fileName || fileName === "") {
            throw new Error("Invalid connector file name");
        }
        return fileName;
    });
    if (!connectors || connectors.length === 0) {
        throw new Error("No connectors found");
    }
    return connectors;
};

const connectorInitializationErrorMessage = (connector: string): string => {
    const msg = `An error occurred initializing ${connector}`;
    return msg;
};

const invalidConnectorErrorMessage = async (
    connector: string,
    availableConnectors: string[]
): Promise<string> => {
    const msg = `${connector} is not a supported connector. Please use one of the currently available connectors: [${availableConnectors.join(
        ", "
    )}]`;
    return msg;
};

const validateConnector = async (connector: string): Promise<void> => {
    const availableConnectors = await getAvailableConnectors();
    if (!connector || !availableConnectors.includes(connector.toLowerCase())) {
        throw new Error(
            await invalidConnectorErrorMessage(connector, availableConnectors)
        );
    }
};

const validateisPool = (isPool?: boolean): void => {
    if (isPool !== undefined && typeof isPool !== "boolean") {
        throw new Error(`The isPool option must be a boolean.`);
    }
};

const REQUIRED_OPTIONS: RequiredOption[] = [
    { name: "connectionString", type: "string" },
    { name: "connector", type: "string" },
];

const checkRequiredOptions = (opts: Options): boolean => {
    let checker = true;
    REQUIRED_OPTIONS.forEach((opt) => {
        const failsCheck =
            opts[opt.name] === undefined ||
            (opts[opt.name] !== undefined &&
                typeof opts[opt.name] !== opt.type);
        if (failsCheck) {
            checker = false;
        }
    });
    return checker;
};

const missingOptionsErrorMessage = (): string => {
    const msg = `Oops, looks like you forgot to pass your options. Missing one or more of the required options: [${REQUIRED_OPTIONS.map(
        (opt) => opt.name
    ).join(", ")}]`;
    return msg;
};

const validateOptions = async (opts: Options): Promise<void> => {
    if (!opts || !checkRequiredOptions(opts)) {
        throw new Error(missingOptionsErrorMessage());
    }
    await validateConnector(opts.connector);
    validateisPool(opts.isPool);
};

const getConnector = async (opts: Options): Promise<any> => {
    const connectorModule = await import(`../connectors/${opts.connector}.js`);
    if (!connectorModule.default) {
        throw new Error(connectorInitializationErrorMessage(opts.connector));
    }
    return connectorModule.default(opts);
};

// Change the return type to include more connectors return
// types when they are added
const deriveConnector = async (opts: Options): Promise<PGJSConnectors> => {
    console.log("Original");
    await validateOptions(opts);
    return getConnector(opts);
};

// Exporting functions and constants using ESM syntax
export {
    deriveConnector,
    getAvailableConnectors,
    missingOptionsErrorMessage,
    invalidConnectorErrorMessage,
    connectorInitializationErrorMessage,
};
