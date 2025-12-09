using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services
{
    public class ReceiptPrintingService
    {
        // Width for 80mm thermal paper (approx 3.15 inches). 
        // WPF uses 96 DPI. 3.15 * 96 ~= 302 pixels. 
        // We use a safe width like 280-290 to allow margins.
        private const double PageWidth = 300; 

        public void PrintReceipt(Order order, decimal amountPaid, decimal change, string paymentMethod, string cashierName = "Admin")
        {
            try
            {
                var doc = CreateReceiptDocument(order, amountPaid, change, paymentMethod, cashierName);
                
                var printDialog = new System.Windows.Controls.PrintDialog();
                if (printDialog.ShowDialog() == true)
                {
                    // Set flow document restrictions to match printer printable area
                    doc.PageWidth = printDialog.PrintableAreaWidth;
                    doc.PagePadding = new Thickness(10);
                    doc.ColumnGap = 0;
                    doc.ColumnWidth = printDialog.PrintableAreaWidth;

                    IDocumentPaginatorSource idpSource = doc;
                    printDialog.PrintDocument(idpSource.DocumentPaginator, $"Receipt_{order.Id}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi in hóa đơn: {ex.Message}", "Lỗi in ấn", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        public void PrintKitchenTicket(Order order, string note = "")
        {
            try
            {
                var doc = CreateKitchenTicketDocument(order, note);
                
                var printDialog = new System.Windows.Controls.PrintDialog();
                if (printDialog.ShowDialog() == true)
                {
                    doc.PageWidth = printDialog.PrintableAreaWidth;
                    doc.PagePadding = new Thickness(10);
                    doc.ColumnGap = 0;
                    doc.ColumnWidth = printDialog.PrintableAreaWidth;

                    IDocumentPaginatorSource idpSource = doc;
                    printDialog.PrintDocument(idpSource.DocumentPaginator, $"Kitchen_{order.Id}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi in bếp: {ex.Message}", "Lỗi in ấn", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private FlowDocument CreateKitchenTicketDocument(Order order, string note)
        {
            var doc = new FlowDocument
            {
                FontFamily = new FontFamily("Arial"),
                FontSize = 12, // Larger font for kitchen
                PagePadding = new Thickness(5),
                TextAlignment = TextAlignment.Left,
                PageWidth = PageWidth
            };

            // 1. Header (Kitchen Ticket)
            var header = new Paragraph();
            header.TextAlignment = TextAlignment.Center;
            header.Inlines.Add(new Run("PHIẾU BẾP") { FontSize = 18, FontWeight = FontWeights.Bold });
            header.Inlines.Add(new LineBreak());
            header.Inlines.Add(new Run($"Bàn: {order.TableId}") { FontSize = 16, FontWeight = FontWeights.Bold });
            header.Inlines.Add(new LineBreak());
            header.Inlines.Add(new Run($"#{order.Id} - {DateTime.Now:HH:mm}"));
            doc.Blocks.Add(header);

            doc.Blocks.Add(new BlockUIContainer(new Separator()));

            // 2. Note
            if (!string.IsNullOrEmpty(note))
            {
                var notePara = new Paragraph();
                notePara.Inlines.Add(new Run($"Ghi chú: {note}") { FontWeight = FontWeights.Bold, FontStyle = FontStyles.Italic });
                doc.Blocks.Add(notePara);
                doc.Blocks.Add(new BlockUIContainer(new Separator()));
            }

            // 3. Items Table (Qty - Name - Note)
            var table = new System.Windows.Documents.Table();
            table.CellSpacing = 0;
            
            var colQty = new TableColumn { Width = new GridLength(1, GridUnitType.Star) }; 
            var colName = new TableColumn { Width = new GridLength(4, GridUnitType.Star) };
            
            table.Columns.Add(colQty);
            table.Columns.Add(colName);

            // Header Row
            var rowGroup = new TableRowGroup();
            var headerRow = new TableRow();
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("SL")) { FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Center }));
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("Tên món")) { FontWeight = FontWeights.Bold }));
            rowGroup.Rows.Add(headerRow);

            // Data Rows
            foreach (var item in order.OrderItems)
            {
                var row = new TableRow();
                
                // Qty (Bold, Large)
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Quantity.ToString())) { FontWeight = FontWeights.Bold, FontSize = 14, TextAlignment = TextAlignment.Center }));
                
                // Name + Note
                var namePara = new Paragraph();
                namePara.Inlines.Add(new Run(item.Product?.Name ?? "Unknown") { FontSize = 14, FontWeight = FontWeights.Bold });
                if (!string.IsNullOrEmpty(item.Note))
                {
                    namePara.Inlines.Add(new LineBreak());
                    namePara.Inlines.Add(new Run($"({item.Note})") { FontSize = 12, FontStyle = FontStyles.Italic, Foreground = Brushes.Gray });
                }
                row.Cells.Add(new TableCell(namePara));
                
                rowGroup.Rows.Add(row);
            }

            table.RowGroups.Add(rowGroup);
            doc.Blocks.Add(table);

            doc.Blocks.Add(new BlockUIContainer(new Separator()));

            return doc;
        }

        private FlowDocument CreateReceiptDocument(Order order, decimal amountPaid, decimal change, string paymentMethod, string cashierName)
        {
            var doc = new FlowDocument
            {
                FontFamily = new FontFamily("Arial"),
                FontSize = 10,
                PagePadding = new Thickness(5),
                TextAlignment = TextAlignment.Left,
                PageWidth = PageWidth
            };

            // 1. Header
            var header = new Paragraph();
            header.TextAlignment = TextAlignment.Center;
            header.Inlines.Add(new Run("RESTAURANT POS SYSTEM") { FontSize = 14, FontWeight = FontWeights.Bold });
            header.Inlines.Add(new LineBreak());
            header.Inlines.Add(new Run("123 Đ. Lê Lợi, Q.1, TP.HCM"));
            header.Inlines.Add(new LineBreak());
            header.Inlines.Add(new Run("Hotline: 0901 234 567"));
            doc.Blocks.Add(header);

            doc.Blocks.Add(new BlockUIContainer(new Separator()));

            // 2. Info
            var info = new Paragraph();
            info.Inlines.Add(new Run($"Hóa đơn #: {order.Id}"));
            info.Inlines.Add(new LineBreak());
            info.Inlines.Add(new Run($"Ngày: {DateTime.Now:dd/MM/yyyy HH:mm}"));
            info.Inlines.Add(new LineBreak());
            info.Inlines.Add(new Run($"Bàn: {order.TableId}")); // Ideally Table Name
            info.Inlines.Add(new LineBreak());
            info.Inlines.Add(new Run($"Thu ngân: {cashierName}"));
            doc.Blocks.Add(info);

            doc.Blocks.Add(new BlockUIContainer(new Separator()));

            // 3. Items Table
            var table = new System.Windows.Documents.Table();
            table.CellSpacing = 0;
            // Columns: Name (Product), Qty, Price, Amount
            var col1 = new TableColumn { Width = new GridLength(3, GridUnitType.Star) }; // Name
            var col2 = new TableColumn { Width = new GridLength(1, GridUnitType.Star) }; // Qty
            var col3 = new TableColumn { Width = new GridLength(1.5, GridUnitType.Star) }; // Amount
            table.Columns.Add(col1);
            table.Columns.Add(col2);
            table.Columns.Add(col3);

            // Header Row
            var rowGroup = new TableRowGroup();
            var headerRow = new TableRow();
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("Tên món")) { FontWeight = FontWeights.Bold }));
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("SL")) { FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Center }));
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("T.Tiền")) { FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Right }));
            rowGroup.Rows.Add(headerRow);

            // Data Rows
            foreach (var item in order.OrderItems)
            {
                var row = new TableRow();
                var productName = item.Product?.Name ?? "Món đã xóa";
                row.Cells.Add(new TableCell(new Paragraph(new Run(productName))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Quantity.ToString())) { TextAlignment = TextAlignment.Center }));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.TotalPrice.ToString("N0"))) { TextAlignment = TextAlignment.Right }));
                rowGroup.Rows.Add(row);
            }

            table.RowGroups.Add(rowGroup);
            doc.Blocks.Add(table);

            doc.Blocks.Add(new BlockUIContainer(new Separator()));

            // 4. Totals
            var totals = new Paragraph();
            totals.TextAlignment = TextAlignment.Right;
            totals.Inlines.Add(new Run($"Tổng cộng:  {order.TotalAmount:N0} đ") { FontSize = 12, FontWeight = FontWeights.Bold });
            totals.Inlines.Add(new LineBreak());
            
            // Assuming Discount Logic is handled in Final Amount logic elsewhere, 
            // but here we just print what we have. 
            // If discount exists in Order model, display it.

            totals.Inlines.Add(new Run($"Khách đưa:  {amountPaid:N0} đ"));
            totals.Inlines.Add(new LineBreak());
            totals.Inlines.Add(new Run($"Tiền thừa:  {change:N0} đ"));
            totals.Inlines.Add(new LineBreak());
            totals.Inlines.Add(new Run($"TT: {paymentMethod}"));
            doc.Blocks.Add(totals);

            doc.Blocks.Add(new BlockUIContainer(new Separator()));

            // 5. Footer
            var footer = new Paragraph();
            footer.TextAlignment = TextAlignment.Center;
            footer.Inlines.Add(new Run("Cảm ơn quý khách & Hẹn gặp lại!") { FontStyle = FontStyles.Italic });
            footer.Inlines.Add(new LineBreak());
            footer.Inlines.Add(new Run("Wifi: Restaurant_Free / Pass: 12345678"));
            doc.Blocks.Add(footer);

            return doc;
        }
    }
}
