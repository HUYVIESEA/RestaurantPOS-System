using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFcmTokenToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FcmToken",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "FcmToken", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 1, 5, 10, 10, 18, DateTimeKind.Utc).AddTicks(6872), null, "$2a$11$5xo7Lyuj7TaCoSRzAhPgne.gfBoxcKI1/NIyix5RxxzrSN2HrgPXe" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FcmToken",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 1, 5, 1, 34, 964, DateTimeKind.Utc).AddTicks(7960), "$2a$11$Cjs70hldDgtuCQCLL0SH/eBVPMBJZbkyX1QTMaD.zkkPrY5hMgbte" });
        }
    }
}
