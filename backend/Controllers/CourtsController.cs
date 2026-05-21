using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CourtsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CourtsController(AppDbContext db) { _db = db; }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll() => Ok(await _db.Courts.Include(c => c.Location).Where(c => c.Enabled).ToListAsync());

        [HttpGet("{id}/bookings")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookings(int id, [FromQuery] string date)
        {
            var q = _db.Bookings.Where(b => b.CourtId == id);
            if (!string.IsNullOrEmpty(date))
            {
                if (System.DateTime.TryParse(date, out var d))
                {
                    var start = d.Date;
                    var end = start.AddDays(1);
                    q = q.Where(b => b.Start < end && b.End > start);
                }
            }
            return Ok(await q.ToListAsync());
        }

        // Admin endpoints
        [HttpPost]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> Create([FromBody] CreateCourtRequest req)
        {
            if (string.IsNullOrEmpty(req.CourtName)) return BadRequest("CourtName required");
            if (req.LocationId <= 0) return BadRequest("LocationId required");

            var location = await _db.Locations.FindAsync(req.LocationId);
            if (location == null) return NotFound("Location not found");

            var court = new Court { CourtName = req.CourtName, Enabled = true, LocationId = req.LocationId };
            _db.Courts.Add(court);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), court);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCourtRequest req)
        {
            var court = await _db.Courts.FindAsync(id);
            if (court == null) return NotFound();

            if (!string.IsNullOrEmpty(req.CourtName)) court.CourtName = req.CourtName;
            if (req.Enabled.HasValue) court.Enabled = req.Enabled.Value;
            if (req.LocationId.HasValue && req.LocationId.Value > 0)
            {
                var location = await _db.Locations.FindAsync(req.LocationId.Value);
                if (location == null) return NotFound("Location not found");
                court.LocationId = req.LocationId.Value;
            }

            await _db.SaveChangesAsync();
            return Ok(court);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> Delete(int id)
        {
            var court = await _db.Courts.FindAsync(id);
            if (court == null) return NotFound();
            _db.Courts.Remove(court);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }

    public class CreateCourtRequest
    {
        public string CourtName { get; set; }
        public int LocationId { get; set; }
    }

    public class UpdateCourtRequest
    {
        public string CourtName { get; set; }
        public bool? Enabled { get; set; }
        public int? LocationId { get; set; }
    }
}
