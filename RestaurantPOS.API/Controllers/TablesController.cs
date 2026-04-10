using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;

namespace RestaurantPOS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TablesController : ControllerBase
{
    private readonly ITableService _tableService;

    public TablesController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Table>>> GetTables()
    {
        var tables = await _tableService.GetAllTablesAsync();
        return Ok(tables);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Table>> GetTable(int id)
    {
        var table = await _tableService.GetTableByIdAsync(id);
        if (table == null) return NotFound();
        return Ok(table);
    }

    [HttpGet("Available")]
    public async Task<ActionResult<IEnumerable<Table>>> GetAvailableTables()
    {
        var tables = await _tableService.GetAvailableTablesAsync();
        return Ok(tables);
    }

    [HttpGet("Floor/{floor}")]
    public async Task<ActionResult<IEnumerable<Table>>> GetTablesByFloor(string floor)
    {
        var tables = await _tableService.GetTablesByFloorAsync(floor);
        return Ok(tables);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<Table>> CreateTable(Table table)
    {
        var result = await _tableService.CreateTableAsync(table);
        return CreatedAtAction(nameof(GetTable), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateTable(int id, Table table)
    {
        if (id != table.Id) return BadRequest();

        var result = await _tableService.UpdateTableAsync(id, table);
        if (result == null) return NotFound();
        return NoContent();
    }

    [HttpPatch("{id}/Availability")]
    public async Task<IActionResult> UpdateTableAvailability(int id, [FromBody] bool isAvailable)
    {
        var result = await _tableService.UpdateTableAvailabilityAsync(id, isAvailable);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/Return")]
    public async Task<IActionResult> ReturnTable(int id)
    {
        try
        {
            var result = await _tableService.ReturnTableAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> DeleteTable(int id)
    {
        var result = await _tableService.DeleteTableAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("Merge")]
    public async Task<ActionResult<MergeTablesResponse>> MergeTables([FromBody] MergeTablesRequest request)
    {
        try
        {
            var result = await _tableService.MergeTablesAsync(request.TableIds);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("Split/{groupId}")]
    public async Task<IActionResult> SplitTables(int groupId)
    {
        try
        {
            var result = await _tableService.SplitTablesAsync(groupId);
            if (!result) return NotFound("Không tìm thấy nhóm bàn ghép");
            return Ok(new { Message = "Đã tách bàn thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("Merged")]
    public async Task<ActionResult<IEnumerable<MergedTableGroup>>> GetMergedTables()
    {
        var groups = await _tableService.GetMergedTablesAsync();
        return Ok(groups);
    }
}
