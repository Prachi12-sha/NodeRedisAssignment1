const redis = require('../config/db');
const validateOrderData = require("../Validation/OrderSchemaValidation");


exports.Data = async function(req, res, next) {
    try {
        const data = req.body;
        const { OperationType, ClientId, OrderId,Token,TenantId, OMSId } = data;
        const clientHashname = `${TenantId}_${OMSId}`;
        const orderHashname = `${TenantId}_${OMSId}_${ClientId}_${Token}`
        const clientKey = ClientId;
        const orderKey = OrderId;

        // Validate against schema
        const { valid, errors } = validateOrderData(data);
        if (!valid) {
            return res.status(400).json({ statusCode: 400, error: "Invalid data format", errors });
        }

        
        const [clientExists, orderExists] = await Promise.all([
            redis.hexists(clientHashname, clientKey),
            redis.hexists(orderHashname, orderKey)
        ]);

        switch (OperationType) {
            case 100:
                if (clientExists === 1) {
                    if (orderExists === 0) {
                        await redis.hset(orderHashname, orderKey, JSON.stringify(data));
                        res.send({Message:`Successfully Added Client with ID ${OrderId} in ${orderHashname}`});
                    } else {
                        res.status(400).json({ statusCode: 400, error: `Order with ID ${OrderId} already exists in ${orderHashname}` });
                    }
                } else {
                    res.status(400).json({ statusCode: 400, error: `Client with ID ${ClientId} does not exist in ${clientHashname}` });
                }
                break;

                case 101:
                    if (clientExists === 1) {
                        if (orderExists === 1) {
                            await redis.hset(orderHashname, orderKey, JSON.stringify(data));
                            res.send({Message:`Successfully Udpdated Client with ID ${OrderId} in ${orderHashname}`});
                        } else {
                            res.status(400).json({ statusCode: 400, error: `Order with ID ${OrderId} does not exists in ${orderHashname}` });
                        }
                    } else {
                        res.status(400).json({ statusCode: 400, error: `Client with ID ${ClientId} does not exist in ${clientHashname}` });
                    }
                    break;
                    case 102:
                        if (clientExists === 1) {
                            if (orderExists === 1) {
                                await redis.hdel(orderHashname, orderKey);
                                res.send({Message:`Successfully Deleted Client with ID ${OrderId} in ${orderHashname}`});
                            } else {
                                res.status(400).json({ statusCode: 400, error: `Order with ID ${OrderId} does not exists in ${orderHashname}` });
                            }
                        } else {
                            res.status(400).json({ statusCode: 400, error: `Client with ID ${ClientId} does not exist in ${clientHashname}` });
                        }
                        break;
            case 103:
                if (clientExists === 1) {
                    if (orderExists === 1) {
                        const hdata = await redis.hget(orderHashname, orderKey);
                        res.json(JSON.parse(hdata));
                    } else {
                        res.status(400).json({ statusCode: 400, error: `Order with ID ${OrderId} does not exists in ${orderHashname}` });
                    }
                } else {
                    res.status(400).json({ statusCode: 400, error: `Client with ID ${ClientId} does not exist in ${clientHashname}` });
                }
                break;   
                case 104:
                    if (clientExists === 1) {
                        const orderHashExists = await redis.exists(orderHashname); // Use exists instead of hexists
                        if (orderHashExists === 1) {
                            const hdata = await redis.hgetall(orderHashname);
                            const parsedData = {};
                            Object.keys(hdata).forEach(key => {
                                parsedData[key] = JSON.parse(hdata[key]);
                            });
                            res.json(parsedData);
                        } else {
                            res.status(400).json({ statusCode: 400, error: `Hash ${orderHashname} does not exist` });
                        }
                    } else {
                        res.status(400).json({ statusCode: 400, error: `Client with ID ${ClientId} does not exist in ${clientHashname}` });
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
