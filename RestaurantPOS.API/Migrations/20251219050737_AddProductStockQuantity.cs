using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProductStockQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StockQuantity",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 19, 5, 7, 36, 999, DateTimeKind.Utc).AddTicks(4010), "$2a$11$p.zCkOn5UgKfxzsearnQAeOuR18ZRLx8Dy8vnMK.U3dv22NinNR1C" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StockQuantity",
                table: "Products");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 11, 6, 14, 51, 47, DateTimeKind.Utc).AddTicks(2799), "$2a$11$Zh4MKiGskbYrTN7Z5r3UaeBSjlztqKdzEzSwY6QHV7W3dKBuaOQ1a" });
        }
    }
}
