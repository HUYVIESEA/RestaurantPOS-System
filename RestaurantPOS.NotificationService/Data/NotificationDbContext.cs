using Microsoft.EntityFrameworkCore;
using RestaurantPOS.NotificationService.Models;

namespace RestaurantPOS.NotificationService.Data;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options) { }

    public DbSet<UserDevice> UserDevices => Set<UserDevice>();
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserDevice>(entity =>
        {
            entity.HasIndex(e => e.DeviceToken).IsUnique();
            entity.HasIndex(e => e.UserId);
        });

        modelBuilder.Entity<NotificationLog>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.SentAt);
        });
    }
}
