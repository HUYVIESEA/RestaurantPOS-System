using RestaurantPOS.API.Models.SePay;

namespace RestaurantPOS.API.Services.SePay
{
    public interface ISePayService
    {
        Task ProcessWebhook(SePayWebhookModel model);
    }
}
