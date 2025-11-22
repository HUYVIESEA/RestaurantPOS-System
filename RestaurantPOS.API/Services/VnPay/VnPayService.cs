using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

namespace RestaurantPOS.API.Services.VnPay
{
    public class VnPayService : IVnPayService
    {
        private readonly IConfiguration _configuration;

        public VnPayService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreatePaymentUrl(HttpContext context, PaymentInformationModel model)
        {
            var tick = DateTime.Now.Ticks.ToString();
            var vnpay = new VnPayLibrary();
            var timeNow = DateTime.Now;

            vnpay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"] ?? "2.1.0");
            vnpay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"] ?? "pay");
            vnpay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"] ?? "");
            vnpay.AddRequestData("vnp_Amount", ((int)model.Amount * 100).ToString());
            
            vnpay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"] ?? "VND");
            vnpay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
            vnpay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"] ?? "vn");
            
            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang:" + (model.OrderDescription ?? ""));
            vnpay.AddRequestData("vnp_OrderType", model.OrderType ?? "other");
            vnpay.AddRequestData("vnp_ReturnUrl", _configuration["Vnpay:ReturnUrl"] ?? "");
            vnpay.AddRequestData("vnp_TxnRef", tick);

            var baseUrl = _configuration["Vnpay:BaseUrl"] ?? "";
            var hashSecret = _configuration["Vnpay:HashSecret"] ?? "";

            var paymentUrl = vnpay.CreateRequestUrl(baseUrl, hashSecret);

            return paymentUrl;
        }

        public PaymentResponseModel PaymentExecute(IQueryCollection collections)
        {
            var vnpay = new VnPayLibrary();
            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value.ToString());
                }
            }

            var vnp_orderId = vnpay.GetResponseData("vnp_TxnRef");
            var vnp_TransactionId = vnpay.GetResponseData("vnp_TransactionNo");
            var vnp_SecureHash = collections.FirstOrDefault(p => p.Key == "vnp_SecureHash").Value.ToString();
            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            var vnp_OrderInfo = vnpay.GetResponseData("vnp_OrderInfo");

            var hashSecret = _configuration["Vnpay:HashSecret"] ?? "";
            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, hashSecret);

            if (!checkSignature)
            {
                return new PaymentResponseModel
                {
                    Success = false
                };
            }

            return new PaymentResponseModel
            {
                Success = true,
                PaymentMethod = "VnPay",
                OrderDescription = vnp_OrderInfo,
                OrderId = vnp_orderId,
                TransactionId = vnp_TransactionId,
                Token = vnp_SecureHash,
                VnPayResponseCode = vnp_ResponseCode
            };
        }
    }
}
