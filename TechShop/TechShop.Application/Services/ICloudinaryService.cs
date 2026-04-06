using System.IO;
using System.Threading.Tasks;

namespace TechShop.Application.Services;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(Stream fileStream, string fileName);
    Task<bool> DeleteImageAsync(string publicId);
}
