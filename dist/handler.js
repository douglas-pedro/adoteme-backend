"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = void 0;
const hello = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello, world!',
            input: event,
        }, null, 2),
    };
};
exports.hello = hello;
