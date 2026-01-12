using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RestaurantPOS.API.Models.BigData
{
    public class MongoOrder
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public int StoreId { get; set; }
        public DateTime CreatedAt { get; set; }
        
        [BsonRepresentation(BsonType.Decimal128)]
        public decimal TotalAmount { get; set; }
        
        public List<MongoOrderItem> Items { get; set; } = new();
    }

    public class MongoOrderItem
    {
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        
        [BsonRepresentation(BsonType.Decimal128)]
        public decimal Price { get; set; }
    }
}
