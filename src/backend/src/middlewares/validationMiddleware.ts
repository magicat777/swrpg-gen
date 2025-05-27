import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request data
 * @param validations Array of express-validator validation chains
 * @returns Express middleware function
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check if there are validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Format the validation errors
      const formattedErrors = errors.array().map(error => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }));
      
      logger.debug('Validation error', { errors: formattedErrors, path: req.path });
      
      // Create an AppError with the validation errors
      const appError = new AppError(
        'Validation error',
        400,
        'VALIDATION_ERROR',
        { errors: formattedErrors }
      );
      
      return next(appError);
    }
    
    // Validation passed, continue
    next();
  };
};

/**
 * Helper function to convert validation errors to a human-readable format
 * @param errors Validation errors from express-validator
 * @returns Error messages by field
 */
export const formatValidationErrors = (errors: any) => {
  const result: Record<string, string> = {};
  
  errors.array().forEach((error: any) => {
    const field = error.type === 'field' ? error.path : error.type;
    result[field] = error.msg;
  });
  
  return result;
};

/**
 * Schema for common validation rules
 */
export const ValidationRules = {
  // String validation
  STRING: {
    REQUIRED: { notEmpty: true, errorMessage: 'Field is required' },
    MIN_LENGTH: (min: number) => ({ 
      isLength: { options: { min } }, 
      errorMessage: `Minimum length is ${min} characters` 
    }),
    MAX_LENGTH: (max: number) => ({ 
      isLength: { options: { max } }, 
      errorMessage: `Maximum length is ${max} characters` 
    }),
    EMAIL: { isEmail: true, errorMessage: 'Invalid email format' },
    ALPHA_NUMERIC: { 
      isAlphanumeric: true, 
      errorMessage: 'Only alphanumeric characters allowed' 
    }
  },
  
  // Numeric validation
  NUMBER: {
    REQUIRED: { notEmpty: true, errorMessage: 'Field is required' },
    MIN: (min: number) => ({ 
      isFloat: { options: { min } }, 
      errorMessage: `Minimum value is ${min}` 
    }),
    MAX: (max: number) => ({ 
      isFloat: { options: { max } }, 
      errorMessage: `Maximum value is ${max}` 
    }),
    INTEGER: { 
      isInt: true, 
      errorMessage: 'Must be an integer value' 
    },
    POSITIVE: { 
      isFloat: { options: { min: 0 } }, 
      errorMessage: 'Must be a positive number' 
    }
  },
  
  // Boolean validation
  BOOLEAN: {
    REQUIRED: { notEmpty: true, errorMessage: 'Field is required' },
    IS_BOOLEAN: { 
      isBoolean: true, 
      errorMessage: 'Must be a boolean value' 
    }
  },
  
  // Array validation
  ARRAY: {
    REQUIRED: { notEmpty: true, errorMessage: 'Field is required' },
    MIN_LENGTH: (min: number) => ({ 
      isArray: { options: { min } }, 
      errorMessage: `Minimum length is ${min} items` 
    }),
    MAX_LENGTH: (max: number) => ({ 
      isArray: { options: { max } }, 
      errorMessage: `Maximum length is ${max} items` 
    })
  },
  
  // Object validation
  OBJECT: {
    REQUIRED: { notEmpty: true, errorMessage: 'Field is required' }
  },
  
  // Date validation
  DATE: {
    REQUIRED: { notEmpty: true, errorMessage: 'Field is required' },
    IS_DATE: { 
      isISO8601: true, 
      errorMessage: 'Must be a valid ISO date' 
    }
  },
  
  // Custom validation
  CUSTOM: {
    MONGO_ID: { 
      isMongoId: true, 
      errorMessage: 'Must be a valid MongoDB ID' 
    },
    UUID: { 
      isUUID: true, 
      errorMessage: 'Must be a valid UUID' 
    },
    JSON: { 
      custom: {
        options: (value: string) => {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            return false;
          }
        }
      }, 
      errorMessage: 'Must be valid JSON' 
    }
  }
};