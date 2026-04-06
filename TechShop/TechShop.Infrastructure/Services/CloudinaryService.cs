using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;
using TechShop.Application.Services;

namespace TechShop.Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var cloudName = configuration["CLOUDINARY_CLOUD_NAME"];
        var apiKey = configuration["CLOUDINARY_API_KEY"];
        var apiSecret = configuration["CLOUDINARY_API_SECRET"];

        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            // Placeholder: If not in config, use environment variables directly (for DotNetEnv)
            cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
            apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
            apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName)
    {
        if (fileStream.Length > 0)
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
                Folder = "techshop_products"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return uploadResult.SecureUrl.ToString();
        }

        return string.Empty;
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        return result.Result == "ok";
    }
}
