using System.Threading.Tasks;
using MaterialDesignThemes.Wpf;
using RestaurantPOS.Desktop.Views.Dialogs;

namespace RestaurantPOS.Desktop.Utilities
{
    public static class DialogHelper
    {
        public static async Task<bool> ShowConfirm(string title, string message)
        {
            var view = new ConfirmationDialog(title, message);
            var result = await DialogHost.Show(view, "RootDialog");
            if (result is bool b) return b;
            if (result is string s && bool.TryParse(s, out var parsed)) return parsed;
            return false;
        }

        public static async Task ShowAlert(string title, string message, string type = "Info")
        {
            var view = new AlertDialog(title, message, type);
            await DialogHost.Show(view, "RootDialog");
        }
    }
}
