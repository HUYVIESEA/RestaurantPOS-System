using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Win32;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services
{
    public class DataImportService
    {
        public class ProductImportDto
        {
            public string Name { get; set; } = "";
            public decimal Price { get; set; }
            public string CategoryName { get; set; } = "";
            public string Description { get; set; } = "";
            public string ImageUrl { get; set; } = "";
        }

        public async Task<List<ProductImportDto>> ImportProductsFromCsvAsync()
        {
            var openFileDialog = new OpenFileDialog
            {
                Filter = "CSV File (*.csv)|*.csv",
                Title = "Chọn file danh sách món ăn để nhập"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                var filePath = openFileDialog.FileName;
                return await Task.Run(() =>
                {
                    var products = new List<ProductImportDto>();
                    try
                    {
                        var lines = File.ReadAllLines(filePath);
                        // Skip header if exists
                        var startIdx = 0;
                        if (lines.Length > 0 && lines[0].ToLower().Contains("tên món"))
                        {
                            startIdx = 1;
                        }

                        // Format expected: Name, Price, CategoryName, Description, ImageUrl (optional)
                        for (int i = startIdx; i < lines.Length; i++)
                        {
                            var line = lines[i];
                            if (string.IsNullOrWhiteSpace(line)) continue;

                            var parts = ParseCsvLine(line);
                            if (parts.Count >= 2)
                            {
                                var product = new ProductImportDto
                                {
                                    Name = parts[0].Trim(),
                                    Price = decimal.TryParse(parts[1], out var p) ? p : 0,
                                    CategoryName = parts.Count > 2 ? parts[2].Trim() : "Khác",
                                    Description = parts.Count > 3 ? parts[3].Trim() : "",
                                    ImageUrl = parts.Count > 4 ? parts[4].Trim() : null
                                };
                                products.Add(product);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // Handle read error
                        System.Diagnostics.Debug.WriteLine($"Error reading CSV: {ex.Message}");
                    }
                    return products;
                });
            }
            return new List<ProductImportDto>();
        }

        private List<string> ParseCsvLine(string line)
        {
            var parts = new List<string>();
            bool inQuotes = false;
            string currentPart = "";

            foreach (char c in line)
            {
                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    parts.Add(currentPart);
                    currentPart = "";
                }
                else
                {
                    currentPart += c;
                }
            }
            parts.Add(currentPart);
            return parts;
        }
    }
}
