const redis = require('../config/db');
const validateClientData = require("../Validation/ClientSchemaValidation");



exports.Data = async function(req, res, next) {
    try {
        const data = req.body;
        const { OperationType, ClientId, TenantId, OMSId } = data;
        const hashname = `${TenantId}_${OMSId}`;
        const key = ClientId;

        // Validate against schema
        const { valid, errors } = validateClientData(data);
        if (!valid) {
            return res.status(400).json({ statusCode: 400, error: "Invalid data format", errors });
        }

        let result;
        switch (OperationType) {
            case 100:
                result = await redis.hexists(hashname, key);
                if (result === 0) {
                    await redis.hset(hashname, key, JSON.stringify(data));
                    res.send({Message:`Successfully Added Client with ID ${ClientId} in ${hashname}`});
                } else {
                    res.status(400).json({ statusCode: 400, error: `Client with ID ${ClientId} already exists in ${hashname}` });
                }
                break;
            case 101:
                result = await redis.hexists(hashname, key);
                if (result === 1) {
                    await redis.hset(hashname, key, JSON.stringify(data));
                    res.send({Message:`Successfully Udpdated Client with ID ${ClientId} in ${hashname}`});
                } else {
                    res.status(404).json({ statusCode: 404, error: `Client with ID ${ClientId} not found in ${hashname}` });
                }
                break;
            case 102:
                result = await redis.hexists(hashname, key);
                if (result === 1) {
                    await redis.hdel(hashname, key);
                    res.send("Successfully Deleted");
                } else {
                    res.status(404).json({ statusCode: 404, error: `Client with ID ${ClientId} not found in ${hashname}` });
                }
                break;
            case 103:
                result = await redis.hexists(hashname, key);
                if (result === 1) {
                    const hdata = await redis.hget(hashname, key);
                    res.json(JSON.parse(hdata));
                } else {
                    res.status(404).json({ statusCode: 404, error: `Client with ID ${ClientId} not found in ${hashname}` });
                }
                break;
            case 104:
                const hdata = await redis.hgetall(hashname);
                if (hdata) {
                    const parsedData = {};
                    Object.keys(hdata).forEach(key => {
                        parsedData[key] = JSON.parse(hdata[key]);
                    });
                    res.json(parsedData);
                } else {
                    res.status(404).json({ statusCode: 404, error: `Hash ${hashname} does not exist` });
                }
                break;
            default:
                res.status(400).json({ statusCode: 400, error: "Invalid OperationType" });
                break;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ statusCode: 500, error: "Internal Server Error" });
    }
};
