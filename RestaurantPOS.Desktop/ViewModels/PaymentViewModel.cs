using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Windows;

namespace RestaurantPOS.Desktop.ViewModels;

public partial class PaymentViewModel : ObservableObject
{
    [ObservableProperty]
    private decimal totalAmount;

    [ObservableProperty]
    private string paymentMethod = "Cash"; // Cash, Transfer

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(ChangeAmount))]
    [NotifyPropertyChangedFor(nameof(CanConfirm))]
    private decimal receivedAmount;

    [ObservableProperty]
    private string? qrCodeUrl; // For future use

    public decimal ChangeAmount => ReceivedAmount - TotalAmount;

    public bool CanConfirm => PaymentMethod == "Transfer" || (PaymentMethod == "Cash" && ReceivedAmount >= TotalAmount);

    public event Action<bool, decimal, string>? PaymentCompleted;

    public PaymentViewModel()
    {
    }

    public void Initialize(decimal amount)
    {
        TotalAmount = amount;
        ReceivedAmount = amount; // Default to exact amount
        GenerateQrCode();
    }

    private void GenerateQrCode()
    {
        // VietQR Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>
        // Demo Account: MBBank (970422) - 0000123456789
        var bankId = "970422"; // MBBank
        var accountNo = "0000123456789";
        var template = "compact";
        var content = "Thanh toan don hang";
        
        QrCodeUrl = $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={TotalAmount}&addInfo={content}";
    }

    [RelayCommand]
    private void SelectCash()
    {
        PaymentMethod = "Cash";
        OnPropertyChanged(nameof(CanConfirm));
    }

    [RelayCommand]
    private void SelectTransfer()
    {
        PaymentMethod = "Transfer";
        OnPropertyChanged(nameof(CanConfirm));
    }

    [RelayCommand]
    private void Confirm()
    {
        if (CanConfirm)
        {
            PaymentCompleted?.Invoke(true, ReceivedAmount, PaymentMethod);
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        PaymentCompleted?.Invoke(false, 0, "");
    }
}
