using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LogsController : ControllerBase
    {
        private readonly IHostingEnvironment _env;
        public LogsController(IHostingEnvironment env) { _env = env; }

        [HttpPost("frontend")]
        public async Task<IActionResult> Frontend([FromBody] dynamic payload)
        {
            try
            {
                var logsDir = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "logs"));
                Directory.CreateDirectory(logsDir);
                var file = Path.Combine(logsDir, "frontend-errors.log");
                var msg = payload?.message ?? "";
                var url = payload?.url ?? "";
                var stack = payload?.stack ?? "";
                var line = $"[{DateTime.UtcNow:O}] message:{msg} url:{url} stack:{stack} ua:{Request.Headers["User-Agent"]}\n";
                await System.IO.File.AppendAllTextAsync(file, line);
            }
            catch { }

            return Ok();
        }
    }
}
