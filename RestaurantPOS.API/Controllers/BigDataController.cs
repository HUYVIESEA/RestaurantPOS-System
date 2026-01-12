using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using RestaurantPOS.API.Models.BigData;
using RestaurantPOS.API.Models.DTOs;

namespace RestaurantPOS.API.Controllers
{
    [Authorize(Roles = "Admin,Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class BigDataController : ControllerBase
    {
        private readonly IMongoCollection<MongoOrder> _ordersCollection;

        public BigDataController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("PosBigData");
            _ordersCollection = database.GetCollection<MongoOrder>("Orders");
        }

        [HttpGet("top-stores")]
        public async Task<ActionResult<List<BigDataStoreRevenueDto>>> GetTopStores()
        {
            var result = await _ordersCollection.Aggregate()
                .Group(new BsonDocument 
                {
                    { "_id", "$StoreId" },
                    { "TotalRevenue", new BsonDocument("$sum", "$TotalAmount") }
                })
                .Sort(new BsonDocument("TotalRevenue", -1))
                .Limit(5)
                .ToListAsync();

            return result.Select(s => new BigDataStoreRevenueDto
            {
                StoreId = s["_id"].ToString() ?? "Unknown",
                TotalRevenue = s["TotalRevenue"].IsDecimal128 ? (decimal)s["TotalRevenue"].AsDecimal128 : 
                               s["TotalRevenue"].IsDouble ? (decimal)s["TotalRevenue"].AsDouble :
                               s["TotalRevenue"].IsInt32 ? (decimal)s["TotalRevenue"].AsInt32 : (decimal)s["TotalRevenue"].AsInt64
            }).ToList();
        }

        [HttpGet("best-sellers")]
        public async Task<ActionResult<List<BigDataProductSalesDto>>> GetBestSellers()
        {
            var result = await _ordersCollection.Aggregate()
                .Unwind<MongoOrder, BsonDocument>(x => x.Items)
                .Project(new BsonDocument { { "Name", "$Items.ProductName" }, { "Qty", "$Items.Quantity" } })
                .Group(new BsonDocument 
                { 
                    { "_id", "$Name" },
                    { "TotalSold", new BsonDocument("$sum", "$Qty") } 
                })
                .Sort(new BsonDocument("TotalSold", -1))
                .Limit(5)
                .ToListAsync();

            return result.Select(p => new BigDataProductSalesDto
            {
                ProductName = p["_id"].ToString() ?? "Unknown",
                TotalSold = p["TotalSold"].IsInt32 ? p["TotalSold"].AsInt32 : (int)p["TotalSold"].AsInt64
            }).ToList();
        }

        [HttpGet("monthly-trends")]
        public async Task<ActionResult<List<BigDataMonthlyRevenueDto>>> GetMonthlyTrends()
        {
            var result = await _ordersCollection.Aggregate()
                .Project(new BsonDocument 
                { 
                    { "Year", new BsonDocument("$year", "$CreatedAt") },
                    { "Month", new BsonDocument("$month", "$CreatedAt") },
                    { "Amount", "$TotalAmount" }
                })
                .Group(new BsonDocument 
                    { 
                        { "_id", new BsonDocument { { "Year", "$Year" }, { "Month", "$Month" } } },
                        { "MonthlySales", new BsonDocument("$sum", "$Amount") }
                    }
                )
                .Sort(new BsonDocument 
                { 
                    { "_id.Year", -1 }, 
                    { "_id.Month", -1 } 
                })
                .Limit(6)
                .ToListAsync();

            return result.Select(t => new BigDataMonthlyRevenueDto
            {
                Year = t["_id"]["Year"].AsInt32,
                Month = t["_id"]["Month"].AsInt32,
                MonthlySales = t["MonthlySales"].IsDecimal128 ? (decimal)t["MonthlySales"].AsDecimal128 : 
                               t["MonthlySales"].IsDouble ? (decimal)t["MonthlySales"].AsDouble :
                               t["MonthlySales"].IsInt32 ? (decimal)t["MonthlySales"].AsInt32 : (decimal)t["MonthlySales"].AsInt64
            }).ToList();
        }
    }
}
