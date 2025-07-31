const Ajv = require('ajv');
const ajvFormats = require('ajv-formats');
const errors = require('../error');
const ajv = new Ajv({ allErrors: true });
ajvFormats(ajv);
const fnaOutputService = require("../services/fnaOutputService");
const validateSchema = require('../public/FNA_templates/fnaOutputSchema.json');

exports.fnaOutput = async (req, res, next) => {
    try
    {
        console.log("[fnaOutputController Controller] Inside request body fnaOutputController Controller" + JSON.stringify(req.body) + "\n");
        const valid = ajv.validate(validateSchema, req.body);
        //  if (!valid) {

        //     console.log("[fnaOutputController Controller] Validation Errors: " + JSON.stringify(ajv.errors) + "\n");

        //     const missingFields = ajv.errors
        //         .filter(error => error.keyword === 'required')
        //         .map(error => error.params.missingProperty);

        //     if (missingFields.length > 0) {
        //         const error = errors.MissingRequiredFields;
        //         return res.status(error.statusCode).json({
        //             errorCode: error.errorCode,
        //             message: `The following required fields are missing: ${missingFields.join(', ')}`,
        //             details: error.details
        //         });
        //     }
        // }
        if (!valid) 
        {
            process.stdout.write("Validation Errors: "+ JSON.stringify(ajv.errors) + "\n");

            // Separate missing required fields from invalid data formats
            const missingFields = ajv.errors
                .filter(error => error.keyword === 'required')
                .map(error => ({
                field: error.params.missingProperty,
                instancePath: error.instancePath
                }));

            const validationErrors = ajv.errors.map(error => ({
                parameter: error.instancePath.substr(1).split('/').pop(),
                message: `${error.instancePath.substr(1).split('/').pop()} parameter should ${error.message}`,
                instancePath: error.instancePath
            }));

            const invalidFields = validationErrors.map(err => err.parameter);

            if (missingFields.length > 0) {
                const error = errors.MissingRequiredFields;
                return res.status(error.statusCode).json({
                errorCode: error.errorCode,
                message: `The following required fields are missing: ${missingFields.map(field => field.field).join(', ')}`,
                details: missingFields.map(field => `Missing field '${field.field}' at '${field.instancePath}'`)
                });
            }
        }
        const fnaOutputReq = await fnaOutputService.fnaOutput(req.body);
       
        if (typeof fnaOutputReq === 'string') {
            const error = errors[fnaOutputReq];
            return res.status(error.statusCode).json({
                errorCode: error.errorCode,
                message: error.message,
                details: error.details
            });
        }

        return res.status(200).json(fnaOutputReq);
    }
    catch (error) 
    {
        console.log(`[fnaOutputController Controller] Error in fnaOutputController Controller :: ${error.message}\n${error.stack}`);
        const internalError = errors.InternalServerError;
        return res.status(internalError.statusCode).json({
            errorCode: internalError.errorCode,
            message: internalError.message,
            details: internalError.details
        });
    }        
}