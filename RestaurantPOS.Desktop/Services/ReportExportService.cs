using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Win32;
using RestaurantPOS.Desktop.Models; // Assuming DTOs are here

namespace RestaurantPOS.Desktop.Services
{
    public class ReportExportService
    {
        public async Task ExportToCsvAsync(
            IEnumerable<ProductReportDto> topProducts, 
            IEnumerable<CategoryReportDto> categoryRevenue,
            DateTime startDate,
            DateTime endDate)
        {
            var saveFileDialog = new SaveFileDialog
            {
                Filter = "CSV File (*.csv)|*.csv",
                FileName = $"BaoCao_DoanhThu_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.csv"
            };

            if (saveFileDialog.ShowDialog() == true)
            {
                var filePath = saveFileDialog.FileName;
                
                await Task.Run(() =>
                {
                    var sb = new StringBuilder();

                    // BOM for Excel to read UTF-8 correctly
                    sb.Append('\uFEFF'); 

                    sb.AppendLine($"BÁO CÁO DOANH THU");
                    sb.AppendLine($"Từ ngày,{startDate:dd/MM/yyyy}");
                    sb.AppendLine($"Đến ngày,{endDate:dd/MM/yyyy}");
                    sb.AppendLine();

                    // Section 1: Top Products
                    sb.AppendLine("TOP SẢN PHẨM BÁN CHẠY");
                    sb.AppendLine("Tên món,Số lượng,Doanh thu");
                    foreach (var item in topProducts)
                    {
                        sb.AppendLine($"{EscapeCsv(item.ProductName)},{item.TotalQuantitySold},{item.TotalRevenue}");
                    }
                    sb.AppendLine();

                    // Section 2: Category Revenue
                    sb.AppendLine("DOANH THU THEO DANH MỤC");
                    sb.AppendLine("Danh mục,Doanh thu,Tỷ trọng");
                    decimal totalRevenue = 0;
                    foreach(var c in categoryRevenue) totalRevenue += c.TotalRevenue;

                    foreach (var item in categoryRevenue)
                    {
                        decimal percentage = totalRevenue > 0 ? (item.TotalRevenue / totalRevenue) * 100 : 0;
                        sb.AppendLine($"{EscapeCsv(item.CategoryName)},{item.TotalRevenue},{percentage:F2}%");
                    }
                    sb.AppendLine();
                    sb.AppendLine($"TỔNG DOANH THU,,{totalRevenue}");

                    File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
                });
            }
        }

        public async Task ExportOrdersToCsvAsync(IEnumerable<Models.Order> orders)
        {
            var saveFileDialog = new SaveFileDialog
            {
                Filter = "CSV File (*.csv)|*.csv",
                FileName = $"DanhSachDonHang_{DateTime.Now:yyyyMMdd_HHmm}.csv"
            };

            if (saveFileDialog.ShowDialog() == true)
            {
                var filePath = saveFileDialog.FileName;
                
                await Task.Run(() =>
                {
                    var sb = new StringBuilder();

                    // BOM for Excel to read UTF-8 correctly
                    sb.Append('\uFEFF'); 

                    sb.AppendLine("DANH SÁCH ĐƠN HÀNG");
                    sb.AppendLine($"Ngày xuất,{DateTime.Now:dd/MM/yyyy HH:mm}");
                    sb.AppendLine();

                    sb.AppendLine("Mã đơn,Bàn,Thời gian,Tổng tiền,Trạng thái");
                    
                    foreach (var order in orders)
                    {
                         sb.AppendLine($"{order.Id},Bàn {order.TableId},{order.CreatedAt:dd/MM/yyyy HH:mm},{order.TotalAmount},{EscapeCsv(order.Status)}");
                    }

                    File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
                });
            }
        }

        private string EscapeCsv(string? field)
        {
            if (string.IsNullOrEmpty(field)) return "";
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            return field;
        }
    }
}
