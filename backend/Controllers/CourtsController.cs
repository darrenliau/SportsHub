using System;
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

        // Handle CORS preflight requests
        [HttpOptions]
        [AllowAnonymous]
        public IActionResult Preflight()
        {
            return Ok();
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll() => Ok(await _db.Courts.Include(c => c.Location).Where(c => c.Enabled).ToListAsync());

        [HttpGet("admin/all")]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> GetAllIncludingDisabled() => Ok(await _db.Courts.Include(c => c.Location).ToListAsync());

        [HttpGet("{id:int}/bookings")]
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

        [HttpPut("{id:int}")]
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

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> Delete(int id)
        {
            var court = await _db.Courts.FindAsync(id);
            if (court == null) return NotFound();
            _db.Courts.Remove(court);
            await _db.SaveChangesAsync();
            return Ok();
        }

        // Blackout date endpoints
        [HttpOptions("{courtId}/blackouts")]
        [AllowAnonymous]
        public IActionResult BlackoutPreflight(int courtId)
        {
            return Ok();
        }

        [HttpOptions("{courtId}/blackouts/{blackoutId}")]
        [AllowAnonymous]
        public IActionResult BlackoutDeletePreflight(int courtId, int blackoutId)
        {
            return Ok();
        }

        [HttpGet("{courtId}/blackouts")]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> GetBlackoutDates(int courtId)
        {
            var blackouts = await _db.CourtBlackoutDates.Where(b => b.CourtId == courtId).OrderBy(b => b.DateStart).ToListAsync();
            return Ok(blackouts);
        }

        [HttpPost("{courtId}/blackouts")]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> CreateBlackoutDate(int courtId, [FromBody] CreateBlackoutDateRequest req)
        {
            var court = await _db.Courts.FindAsync(courtId);
            if (court == null) return NotFound("Court not found");

            if (req.DateStart >= req.DateEnd) return BadRequest("DateStart must be before DateEnd");

            var blackout = new CourtBlackoutDate 
            { 
                CourtId = courtId, 
                DateStart = req.DateStart, 
                DateEnd = req.DateEnd, 
                Reason = req.Reason 
            };
            _db.CourtBlackoutDates.Add(blackout);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBlackoutDates), new { courtId }, blackout);
        }

        [HttpDelete("{courtId}/blackouts/{blackoutId}")]
        [Authorize(Roles = "operator")]
        public async Task<IActionResult> DeleteBlackoutDate(int courtId, int blackoutId)
        {
            var blackout = await _db.CourtBlackoutDates.FindAsync(blackoutId);
            if (blackout == null || blackout.CourtId != courtId) return NotFound();

            _db.CourtBlackoutDates.Remove(blackout);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }

    public class CreateBlackoutDateRequest
    {
        public DateTime DateStart { get; set; }
        public DateTime DateEnd { get; set; }
        public string Reason { get; set; }
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
