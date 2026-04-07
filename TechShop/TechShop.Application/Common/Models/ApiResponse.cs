namespace TechShop.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T? Data { get; set; }

    public static ApiResponse<T> SuccessResult(T? data, string message = "Thành công") 
        => new ApiResponse<T> { Success = true, Message = message, Data = data };

    public static ApiResponse<T> FailureResult(string message) 
        => new ApiResponse<T> { Success = false, Message = message, Data = default };
}
