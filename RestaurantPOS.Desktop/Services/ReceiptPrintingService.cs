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
                
                // Show Preview First
                var previewWindow = new Views.ReceiptPreviewWindow(doc);
                previewWindow.ShowDialog();

                if (previewWindow.IsConfirmed)
                {
                    var printDialog = new System.Windows.Controls.PrintDialog();
                    if (printDialog.ShowDialog() == true)
                    {
                        // Reset document restrictions for actual printing
                        doc.PageWidth = printDialog.PrintableAreaWidth;
                        doc.PagePadding = new Thickness(10);
                        doc.ColumnGap = 0;
                        doc.ColumnWidth = printDialog.PrintableAreaWidth;

                        IDocumentPaginatorSource idpSource = doc;
                        printDialog.PrintDocument(idpSource.DocumentPaginator, $"Receipt_{order.Id}");
                    }
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
                
                // Show Preview First
                var previewWindow = new Views.ReceiptPreviewWindow(doc);
                previewWindow.ShowDialog();

                if (previewWindow.IsConfirmed)
                {
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
            var settings = LocalSettingsService.Instance.Settings;

            FlowDocument doc = new FlowDocument
            {
                PagePadding = new Thickness(0),
                FontFamily = new FontFamily("Segoe UI"),
                FontSize = 11,
                Background = Brushes.White
            };

            // 1. HEADER
            Paragraph header = new Paragraph
            {
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 0, 0, 10)
            };
            header.Inlines.Add(new Run(settings.StoreName) { FontSize = 14, FontWeight = FontWeights.Bold });
            header.Inlines.Add(new LineBreak());
            header.Inlines.Add(new Run(settings.StoreAddress));
            header.Inlines.Add(new LineBreak());
            header.Inlines.Add(new Run($"Hotline: {settings.StorePhone}"));
            
            doc.Blocks.Add(header);

            // ... (Invoice Info)
            var createdDate = order.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm");
            Paragraph invoiceInfo = new Paragraph
            {
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 0, 0, 10)
            };
            invoiceInfo.Inlines.Add(new Run($"HÓA ĐƠN THANH TOÁN") { FontSize = 13, FontWeight = FontWeights.Bold });
            invoiceInfo.Inlines.Add(new LineBreak());
            invoiceInfo.Inlines.Add(new Run($"Số phiếu: #{order.Id}"));
            invoiceInfo.Inlines.Add(new LineBreak());
            invoiceInfo.Inlines.Add(new Run($"Ngày: {createdDate}"));
            invoiceInfo.Inlines.Add(new LineBreak());
            invoiceInfo.Inlines.Add(new Run($"Bàn: {order.TableId} - Thu ngân: {cashierName}"));
            
            doc.Blocks.Add(invoiceInfo);

            // ... (Table - Products)
            System.Windows.Documents.Table table = new System.Windows.Documents.Table { CellSpacing = 0 };
            table.Columns.Add(new TableColumn { Width = new GridLength(2, GridUnitType.Star) }); // Name
            table.Columns.Add(new TableColumn { Width = new GridLength(1, GridUnitType.Star) }); // Qty
            table.Columns.Add(new TableColumn { Width = new GridLength(1.5, GridUnitType.Star) }); // Price
            table.Columns.Add(new TableColumn { Width = new GridLength(1.5, GridUnitType.Star) }); // Total

            // Header Row
            TableRowGroup headerGroup = new TableRowGroup();
            TableRow headerRow = new TableRow();
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("Tên món")) { FontWeight = FontWeights.Bold }));
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("SL")) { FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Center }));
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("Đ.Giá")) { FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Right }));
            headerRow.Cells.Add(new TableCell(new Paragraph(new Run("T.Tiền")) { FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Right }));
            headerGroup.Rows.Add(headerRow);
            table.RowGroups.Add(headerGroup);

            // Item Rows
            TableRowGroup itemGroup = new TableRowGroup();
            foreach (var item in order.OrderItems)
            {
                TableRow row = new TableRow();
                string productName = item.Product?.Name ?? "Món";
                if (productName.Length > 20) productName = productName.Substring(0, 18) + "...";

                row.Cells.Add(new TableCell(new Paragraph(new Run(productName))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Quantity.ToString())) { TextAlignment = TextAlignment.Center }));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.UnitPrice.ToString("N0"))) { TextAlignment = TextAlignment.Right }));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.TotalPrice.ToString("N0"))) { TextAlignment = TextAlignment.Right }));
                itemGroup.Rows.Add(row);
            }
            table.RowGroups.Add(itemGroup);
            doc.Blocks.Add(table);

            // Divider
            Paragraph divider = new Paragraph(new Run("--------------------------------------------------")) { TextAlignment = TextAlignment.Center, Margin = new Thickness(0, 5, 0, 5) };
            doc.Blocks.Add(divider);

            // Totals
            System.Windows.Documents.Table totalTable = new System.Windows.Documents.Table { CellSpacing = 0 };
            totalTable.Columns.Add(new TableColumn { Width = new GridLength(1, GridUnitType.Star) });
            totalTable.Columns.Add(new TableColumn { Width = new GridLength(1, GridUnitType.Star) });

            TableRowGroup totalGroup = new TableRowGroup();
            
            // Total
            TableRow rowTotal = new TableRow();
            rowTotal.Cells.Add(new TableCell(new Paragraph(new Run("Tổng cộng:")) { FontWeight = FontWeights.Bold }));
            rowTotal.Cells.Add(new TableCell(new Paragraph(new Run(order.TotalAmount.ToString("N0") + " đ")) { TextAlignment = TextAlignment.Right, FontWeight = FontWeights.Bold }));
            totalGroup.Rows.Add(rowTotal);

            // Paid
            if (paymentMethod != "Reprint")
            {
                TableRow rowPaid = new TableRow();
                rowPaid.Cells.Add(new TableCell(new Paragraph(new Run("Khách đưa:"))));
                rowPaid.Cells.Add(new TableCell(new Paragraph(new Run(amountPaid.ToString("N0") + " đ")) { TextAlignment = TextAlignment.Right }));
                totalGroup.Rows.Add(rowPaid);

                TableRow rowChange = new TableRow();
                rowChange.Cells.Add(new TableCell(new Paragraph(new Run("Tiền thừa:"))));
                rowChange.Cells.Add(new TableCell(new Paragraph(new Run(change.ToString("N0") + " đ")) { TextAlignment = TextAlignment.Right }));
                totalGroup.Rows.Add(rowChange);
            }

            totalTable.RowGroups.Add(totalGroup);
            doc.Blocks.Add(totalTable);

            // Footer
            Paragraph footer = new Paragraph
            {
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 10, 0, 0),
                FontSize = 10,
                FontStyle = FontStyles.Italic
            };
            footer.Inlines.Add(new Run("Cảm ơn quý khách và hẹn gặp lại!"));
            footer.Inlines.Add(new LineBreak());
            if (!string.IsNullOrEmpty(settings.WifiSSID))
            {
                footer.Inlines.Add(new Run($"Wifi: {settings.WifiSSID} / Pass: {settings.WifiPassword}"));
                footer.Inlines.Add(new LineBreak());
            }
            footer.Inlines.Add(new Run("Powered by RestaurantPOS"));
            
            doc.Blocks.Add(footer);

            return doc;
        }
    }
}
