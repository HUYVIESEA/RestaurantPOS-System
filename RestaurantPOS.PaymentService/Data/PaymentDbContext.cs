using Microsoft.EntityFrameworkCore;
using RestaurantPOS.PaymentService.Models;

namespace RestaurantPOS.PaymentService.Data;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentSettings> PaymentSettings => Set<PaymentSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
        });
    }
}
