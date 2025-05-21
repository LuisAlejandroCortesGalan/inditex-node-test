/// <reference types="node" />
/// <reference types="node/http" />
/// <reference types="dist/middleware/requestlogger" />
declare const server: import('http').Server<
  typeof import('http').IncomingMessage,
  typeof import('http').ServerResponse
>;
export default server;
