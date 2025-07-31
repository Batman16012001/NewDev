module.exports = {
    MissingRequiredFields: {
        statusCode: 400,
        errorCode: 'MissingRequiredFields',
        message: 'The following required fields are missing: [list of missing fields].',
        details: 'Ensure all required fields are provided in the request.'
    },
    InvalidDataFormat: {
        statusCode: 400,
        errorCode: 'InvalidDataFormat',
       // message: "Invalid Input",
      //  details: "Ensure the provided input matches the required format."
    },
    DatabaseError: {
        statusCode: 500,
        errorCode: 'DatabaseError',
        message: 'A database error occurred.',
        details: 'Please try again later or contact support if the issue persists.'
    },
    InternalServerError: {
        statusCode: 500,
        errorCode: 'InternalServerError',
        message: 'An internal server error occurred.',
        details: 'Please try again later or contact support if the issue persists.'
    },
    //basePages
    
    CaseIdNotFound: {
        statusCode: 404,
        errorCode: 'CaseIdNotFound',
        message: 'case ID {caseId} is not valid.',
        details: 'CaseId provided is not valid.'
    },
    MissingRiderFields: {
        statusCode: 400,
        errorCode: 'MissingRiderFields',
        message: 'The following required fields are missing in coverage: basic plan.',
        details: 'At least one coverage must be basic plan.'
    }
    
};
