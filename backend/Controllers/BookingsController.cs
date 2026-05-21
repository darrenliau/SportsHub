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
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public BookingsController(AppDbContext db) { _db = db; }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll() => Ok(await _db.Bookings.Include(b=>b.Court).ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Booking booking)
        {
            if (booking.End <= booking.Start) return BadRequest("End must be after start");

            // Check overlap for same court
            var overlap = await _db.Bookings.AnyAsync(b => b.CourtId == booking.CourtId && booking.Start < b.End && booking.End > b.Start);
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

            // Check overlap excluding this booking
            var overlap = await _db.Bookings.AnyAsync(b => b.Id != id && b.CourtId == booking.CourtId && booking.Start < b.End && booking.End > b.Start);
            if (overlap) return Conflict(new { message = "Timeslot not available" });

            existing.Start = booking.Start;
            existing.End = booking.End;
            existing.Title = booking.Title;
            existing.CourtId = booking.CourtId;

            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _db.Bookings.FindAsync(id);
            if (existing == null) return NotFound();
            _db.Bookings.Remove(existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
