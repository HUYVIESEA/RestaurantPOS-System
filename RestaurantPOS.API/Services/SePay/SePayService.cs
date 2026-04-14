using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.SePay;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using RestaurantPOS.API.Hubs;

namespace RestaurantPOS.API.Services.SePay
{
    public class SePayService : ISePayService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SePayService> _logger;
        private readonly IHubContext<RestaurantHub, IRestaurantClient> _hubContext;

        public SePayService(ApplicationDbContext context, ILogger<SePayService> logger, IHubContext<RestaurantHub, IRestaurantClient> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        public async Task ProcessWebhook(SePayWebhookModel model)
        {
            _logger.LogInformation($"Received SePay Webhook: {model.ReferenceCode} - {model.Content} - {model.TransferAmount}");

            if (string.IsNullOrEmpty(model.ReferenceCode))
            {
                _logger.LogWarning("SePay webhook ReferenceCode is empty.");
                return;
            }

            // 1. Transaction idempotency check
            // Use ReferenceCode as TransactionId
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionId == model.ReferenceCode);

            if (existingPayment != null)
            {
                _logger.LogInformation($"Transaction {model.ReferenceCode} already processed.");
                return;
            }

            // 2. Extract Order ID from Content
            // Strategy: Find all integers in the content string.
            // Assumption: The content contains the Order ID.
            if (string.IsNullOrEmpty(model.Content))
            {
                _logger.LogWarning("SePay webhook content is empty.");
                return;
            }

            var numbers = Regex.Matches(model.Content, @"\d+");
            Order? matchedOrder = null;

            foreach (Match match in numbers)
            {
                if (int.TryParse(match.Value, out int potentialOrderId))
                {
                    var order = await _context.Orders
                        .Include(o => o.OrderItems)
                        .FirstOrDefaultAsync(o => o.Id == potentialOrderId);

                    if (order != null)
                    {
                        // Optional: Verify amount match if multiple numbers found or to be safe
                        // But for now, if we find a valid order ID, we assume it's the one.
                        // Ideally, we might check if (TransAmount >= Order.TotalAmount) or partial payment logic.
                        
                        // Let's assume the first valid Order ID found is the correct one.
                        // Or we could check if order.TotalAmount matches transfer amount.
                        
                        matchedOrder = order;
                        break; 
                    }
                }
            }

            if (matchedOrder == null)
            {
                _logger.LogWarning($"Could not find matching Order for content: {model.Content}");
                // In a real system, you might duplicate this to a 'UnclaimedPayments' table
                return;
            }

            // 3. Create Payment Record
            var payment = new Payment
            {
                OrderId = matchedOrder.Id,
                Amount = model.TransferAmount,
                Method = "Transfer", // or "SePay"
                TransactionId = model.ReferenceCode,
                Note = $"{model.Description} - {model.Content}",
                PaymentDate = DateTime.TryParse(model.TransactionDate, out var dt) ? dt : DateTime.UtcNow,
                Status = "Success"
            };

            // 4. Update Order
            matchedOrder.PaidAmount = (matchedOrder.PaidAmount ?? 0) + model.TransferAmount;
            
            // Determine status
            // If PaidAmount >= TotalAmount -> Fully Paid
            if (matchedOrder.PaidAmount >= matchedOrder.TotalAmount)
            {
                matchedOrder.PaymentStatus = "Paid";
                // Optionally update overall Status if it was pending
                // matchedOrder.Status = "Completed"; // Maybe? Or keep it separate.
            }
            else
            {
                 matchedOrder.PaymentStatus = "Partial";
            }
            
            matchedOrder.PaymentMethod = "Transfer";

            _context.Payments.Add(payment);
            _context.Orders.Update(matchedOrder);
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"Successfully processed payment for Order {matchedOrder.Id}. Amount: {model.TransferAmount}");
            await _hubContext.Clients.All.OrderUpdated(matchedOrder.Id);
        }
    }
}
