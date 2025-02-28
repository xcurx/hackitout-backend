class ApiResponse{
    statusCode:number
    data:object
    message:string
    success

    constructor(statusCode:number, data:object, message="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}