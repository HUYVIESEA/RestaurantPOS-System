using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.ViewModels;
using RestaurantPOS.Desktop.Views;
using WpfScreenHelper;

namespace RestaurantPOS.Desktop.Services
{
    public class CustomerDisplayService
    {
        private static CustomerDisplayService _instance;
        public static CustomerDisplayService Instance => _instance ??= new CustomerDisplayService();

        private CustomerDisplayWindow? _window;
        private CustomerDisplayViewModel _viewModel;

        private CustomerDisplayService()
        {
            _viewModel = new CustomerDisplayViewModel();
        }

        public void Initialize(string screenDeviceName)
        {
            if (_window != null)
            {
                _window.Close();
                _window = null;
            }

            var screen = Screen.AllScreens.FirstOrDefault(s => s.DeviceName == screenDeviceName);
            if (screen == null) return;

            _window = new CustomerDisplayWindow();
            _window.SetViewModel(_viewModel);
            
            // Position window
            _window.Left = screen.Bounds.Left;
            _window.Top = screen.Bounds.Top;
            _window.Width = screen.Bounds.Width;
            _window.Height = screen.Bounds.Height;
            _window.WindowStartupLocation = WindowStartupLocation.Manual;
            
            _window.Show();
            _window.WindowState = WindowState.Maximized;

            ShowIdle();
        }

        public void Close()
        {
            if (_window != null)
            {
                _window.Close();
                _window = null;
            }
        }

        public void ShowIdle()
        {
            _viewModel.CurrentState = CustomerDisplayViewModel.DisplayState.Idle;
        }

        public void UpdateCart(IEnumerable<CartItem> items, decimal totalAmount)
        {
            _viewModel.CartItems = new System.Collections.ObjectModel.ObservableCollection<CartItem>(items);
            _viewModel.TotalAmount = totalAmount;
            
            if (_viewModel.CurrentState != CustomerDisplayViewModel.DisplayState.Ordering)
            {
                 _viewModel.CurrentState = CustomerDisplayViewModel.DisplayState.Ordering;
            }
        }

        public void ShowPayment(string qrUrl, decimal amount)
        {
            _viewModel.QrCodeUrl = qrUrl;
            _viewModel.PaymentAmount = amount;
            _viewModel.CurrentState = CustomerDisplayViewModel.DisplayState.Payment;
        }
    }
}
