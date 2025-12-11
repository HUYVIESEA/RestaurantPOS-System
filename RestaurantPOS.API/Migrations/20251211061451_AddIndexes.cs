using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 11, 6, 14, 51, 47, DateTimeKind.Utc).AddTicks(2799), "$2a$11$Zh4MKiGskbYrTN7Z5r3UaeBSjlztqKdzEzSwY6QHV7W3dKBuaOQ1a" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSettings_IsActive",
                table: "PaymentSettings",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderDate",
                table: "Orders",
                column: "OrderDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PaymentSettings_IsActive",
                table: "PaymentSettings");

            migrationBuilder.DropIndex(
                name: "IX_Orders_OrderDate",
                table: "Orders");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 10, 10, 9, 10, 251, DateTimeKind.Utc).AddTicks(7759), "$2a$11$0ZtSK1yPTeAKk2T2n9Lpzu80gR.XdEAeSWG8OBK1rciibimMNfba." });
        }
    }
}
