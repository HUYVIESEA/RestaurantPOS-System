using System;
using System.IO;
using System.Text.Json;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services
{
    public class LocalSettingsService
    {
        private static LocalSettingsService? _instance;
        public static LocalSettingsService Instance => _instance ??= new LocalSettingsService();

        private readonly string _filePath;
        public LocalSettings Settings { get; private set; }

        private LocalSettingsService()
        {
            var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            var appFolder = Path.Combine(appDataPath, "RestaurantPOS");
            Directory.CreateDirectory(appFolder);
            _filePath = Path.Combine(appFolder, "settings.json");
            
            Settings = new LocalSettings();
            LoadSettings();
        }

        public void LoadSettings()
        {
            try
            {
                if (File.Exists(_filePath))
                {
                    var json = File.ReadAllText(_filePath);
                    var loaded = JsonSerializer.Deserialize<LocalSettings>(json);
                    if (loaded != null)
                    {
                        Settings = loaded;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Load Settings Error: {ex.Message}");
            }
        }

        public void SaveSettings()
        {
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                var json = JsonSerializer.Serialize(Settings, options);
                File.WriteAllText(_filePath, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Save Settings Error: {ex.Message}");
            }
        }
    }
}
