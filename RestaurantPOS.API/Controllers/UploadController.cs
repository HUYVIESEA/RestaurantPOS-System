using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("Image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Validate file type (allow only images)
            if (!file.ContentType.StartsWith("image/"))
                return BadRequest("Only image files are allowed.");

            try
            {
                // Create wwwroot/images/products directory if it doesn't exist
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "products");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generate unique filename
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the relative URL (e.g., /images/products/filename.jpg)
                // Assuming the client will prepend the Base URL
                var relativeUrl = $"/images/products/{uniqueFileName}";
                
                // Construct full URL explicitly if needed, but relative allows flexibility
                var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                var fullUrl = $"{baseUrl}{relativeUrl}";

                return Ok(new { url = fullUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
