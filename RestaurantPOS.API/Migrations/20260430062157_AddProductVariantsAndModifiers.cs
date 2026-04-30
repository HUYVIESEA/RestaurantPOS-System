using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantPOS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProductVariantsAndModifiers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModifiersJson",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VariantsJson",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 4, 30, 6, 21, 56, 823, DateTimeKind.Utc).AddTicks(5651), "$2a$11$mL3B6.xqPWcg8G.HzCYzI.SSmKuJ0zBQnDWS7.qHFbySK./WAyNWq" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModifiersJson",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "VariantsJson",
                table: "Products");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 4, 10, 5, 39, 28, 427, DateTimeKind.Utc).AddTicks(2495), "$2a$11$lbNmRcUexj.4rzwRl6kc2.WJ0eHMxXFB3oR868ihEYPvNm8trhrdC" });
        }
    }
}
