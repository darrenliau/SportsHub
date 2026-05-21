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
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public BookingsController(AppDbContext db) { _db = db; }

        // Handle CORS preflight requests
        [HttpOptions]
        [AllowAnonymous]
        public IActionResult Preflight()
        {
            return Ok();
        }

        [HttpOptions("{id}/cancel")]
        [AllowAnonymous]
        public IActionResult CancelPreflight(int id)
        {
            return Ok();
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            // Get current user ID and role from claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("User not found");

            var role = roleClaim?.Value;
            var isOperator = role == "operator";

            // Operators see all bookings, customers see only their own
            var query = _db.Bookings.Include(b => b.Court).Where(b => b.Status != "deleted");
            if (!isOperator)
            {
                query = query.Where(b => b.UserId == userId);
            }

            return Ok(await query.ToListAsync());
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Booking booking)
        {
            if (booking.End <= booking.Start) return BadRequest("End must be after start");

            // Get current user ID from claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("User not found");

            booking.UserId = userId;

            // Check overlap for same court (excluding deleted bookings)
            var overlap = await _db.Bookings.AnyAsync(b => b.Status != "deleted" && b.CourtId == booking.CourtId && booking.Start < b.End && booking.End > b.Start);
            if (overlap) return Conflict(new { message = "Timeslot not available" });

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = booking.Id }, booking);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Booking booking)
        {
            var existing = await _db.Bookings.FindAsync(id);
            if (existing == null) return NotFound();
            if (booking.End <= booking.Start) return BadRequest("End must be after start");

            // Check overlap excluding this booking and deleted bookings
            var overlap = await _db.Bookings.AnyAsync(b => b.Id != id && b.Status != "deleted" && b.CourtId == booking.CourtId && booking.Start < b.End && booking.End > b.Start);
            if (overlap) return Conflict(new { message = "Timeslot not available" });

            existing.Start = booking.Start;
            existing.End = booking.End;
            existing.Title = booking.Title;
            existing.CourtId = booking.CourtId;

            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> Cancel(int id)
        {
            var existing = await _db.Bookings.Include(b => b.User).FirstOrDefaultAsync(b => b.Id == id);
            if (existing == null) return NotFound();

            // Get current user ID and role from claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("User not found");

            var role = roleClaim?.Value;
            var isOperator = role == "operator";

            // Allow cancellation if user is the owner OR is an operator
            if (existing.UserId != userId && !isOperator)
                return Forbid();

            existing.Status = "deleted";
            await _db.SaveChangesAsync();
            return Ok(new { message = "Booking cancelled" });
        }
    }
}
