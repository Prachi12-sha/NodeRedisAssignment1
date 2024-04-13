const Ajv = require("ajv");
const orderInfoSchema = require("../schemas/OrderSchema.json");

const ajv = new Ajv();

// Function to validate order information against schema

function validateOrderInfo(data) {
    
    // If OperationType is 104, make OrderId optional
    if (data.OperationType === 104) {
        const modifiedSchema = {
            ...orderInfoSchema,
            required: orderInfoSchema.required.filter(field => field !== "OrderId")
        };
        const valid = ajv.validate(modifiedSchema, data);
        return { valid, errors: ajv.errors };
    }

    // Custom validation for messageType
    if (data.MsgType !== 1120) {
        return { valid: false, errors: [{ message: "Invalid messageType. It should be 1120" }] };
    }

    const valid = ajv.validate(orderInfoSchema, data);
    return { valid, errors: ajv.errors };
}

module.exports = validateOrderInfo;
