using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourtsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CourtsController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _db.Courts.ToListAsync());

        [HttpGet("{id}/bookings")]
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
    }
}
