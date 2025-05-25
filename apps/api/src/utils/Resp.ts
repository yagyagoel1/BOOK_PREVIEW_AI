class Resp{

    static success(data = {}, message = 'Success', statusCode = 200) {
      return {
        success: 1,
        statusCode,
        message,
        ...data,
        timestamp: new Date().toISOString()
      };
    }
  

    static error(message = 'An error occurred', statusCode = 500, errors:Error|null = null,extras={}) {
      return {
        success: 0,
        statusCode,
        message,
        errors,
        timestamp: new Date().toISOString(),
        ...extras
      };
    }
}
  
export default Resp