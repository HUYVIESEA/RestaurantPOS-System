using System;

namespace RestaurantPOS.Desktop.Models
{
    public class LocalSettings
    {
        public string StoreName { get; set; } = "Nhà hàng Tuấn Tú";
        public string StoreAddress { get; set; } = "123 Đường ABC, Quận XYZ, TP.HCM";
        public string StorePhone { get; set; } = "0909123456";
        public string WifiSSID { get; set; } = "Restaurant_Guest";
        public string WifiPassword { get; set; } = "12345678";
        public string PrinterName { get; set; } = "Microsoft Print to PDF";
        public bool AutoPrint { get; set; } = true;
    }
}
