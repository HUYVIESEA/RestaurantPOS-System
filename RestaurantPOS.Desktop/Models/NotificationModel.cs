using System;

namespace RestaurantPOS.Desktop.Models
{
    public class NotificationModel
    {
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public NotificationType Type { get; set; }
        public string TimeAgo => GetTimeAgo(Timestamp);

        public NotificationModel(string message, NotificationType type)
        {
            Message = message;
            Type = type;
            Timestamp = DateTime.Now;
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var span = DateTime.Now - dateTime;
            if (span.TotalMinutes < 1) return "Vừa xong";
            if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} phút trước";
            if (span.TotalHours < 24) return $"{(int)span.TotalHours} giờ trước";
            return dateTime.ToString("dd/MM/yyyy HH:mm");
        }
    }

    public enum NotificationType
    {
        Success,
        Error,
        Info,
        Warning
    }
}
