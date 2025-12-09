using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace RestaurantPOS.Desktop.Models
{
    public class Table : INotifyPropertyChanged
    {
        public int Id { get; set; }
        public string TableNumber { get; set; } = string.Empty;
        public int Capacity { get; set; }
        
        private bool _isAvailable = true;
        public bool IsAvailable 
        { 
            get => _isAvailable;
            set { _isAvailable = value; OnPropertyChanged(); OnPropertyChanged(nameof(DisplayStatus)); OnPropertyChanged(nameof(StatusColor)); }
        }

        public DateTime? OccupiedAt { get; set; }
        public string Floor { get; set; } = "Tầng 1";
        public bool IsMerged { get; set; }
        public int? MergedGroupId { get; set; }
        public string? MergedTableNumbers { get; set; }

        // UI Helper for Merge Mode
        private bool _isSelectedForMerge;
        public bool IsSelectedForMerge
        {
            get => _isSelectedForMerge;
            set { _isSelectedForMerge = value; OnPropertyChanged(); }
        }

        public string DisplayStatus => IsAvailable ? "Trống" : "Có khách";
        public string StatusColor => IsAvailable ? "#4CAF50" : "#F44336"; // Green if available, Red if occupied

        private string _duration = "";
        public string Duration
        {
            get => _duration;
            set { _duration = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasDuration)); }
        }

        public bool HasDuration => !string.IsNullOrEmpty(Duration);

        public void UpdateDuration()
        {
            if (IsAvailable || !OccupiedAt.HasValue)
            {
                if (!string.IsNullOrEmpty(Duration)) Duration = "";
            }
            else
            {
                var span = DateTime.Now - OccupiedAt.Value;
                var newDuration = $"{(int)span.TotalHours:D2}:{span.Minutes:D2}";
                if (Duration != newDuration) Duration = newDuration;
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
