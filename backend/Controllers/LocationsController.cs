using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LocationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public LocationsController(AppDbContext db) { _db = db; }

        // Handle CORS preflight requests
        [HttpOptions]
        [AllowAnonymous]
        public IActionResult Preflight()
        {
            return Ok();
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var locations = await _db.Locations.ToListAsync();
            return Ok(locations);
        }
    }
}
