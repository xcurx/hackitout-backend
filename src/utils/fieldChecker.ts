import {ApiError} from './ApiError.js';

const fieldChecker = (obj: { [key: string]: any }, array: string[]) => {
    const keys = Object.keys(obj);
    const missingFields:string[] = [];
    array.forEach(field => {
        if(!keys.includes(field) || !obj[field]) {
            missingFields.push(field);
        }
    });
    if(missingFields.length > 0) {
        throw new ApiError(400,`Missing fields: ${missingFields.join(', ')}`);
    }
};

export {fieldChecker};