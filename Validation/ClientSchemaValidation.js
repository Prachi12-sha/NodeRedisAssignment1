const Ajv = require("ajv");
const schema = require("../schemas/ClientSchema.json");

const ajv = new Ajv();

// Function to validate client data against schema

function validateClientData(data) {
    // If OperationType is 104, make ClientId optional
    if (data.OperationType === 104) {
        const modifiedSchema = {
            ...schema,
            required: schema.required.filter(field => field !== "ClientId")
        };
        const valid = ajv.validate(modifiedSchema, data);
        return { valid, errors: ajv.errors };
    }

    // Custom validation for messageType
    if (data.MsgType !== 1121) {
        return { valid: false, errors: [{ message: "Invalid messageType. It should be 1121" }] };
    }

    const valid = ajv.validate(schema, data);
    return { valid, errors: ajv.errors };
}

module.exports = validateClientData;
