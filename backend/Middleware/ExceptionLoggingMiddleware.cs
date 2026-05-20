using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace Backend.Middleware
{
    public class ExceptionLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHostingEnvironment _env;
        private readonly string _logPath;

        public ExceptionLoggingMiddleware(RequestDelegate next, IHostingEnvironment env)
        {
            _next = next;
            _env = env;
            _logPath = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "logs"));
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                try
                {
                    Directory.CreateDirectory(_logPath);
                    var file = Path.Combine(_logPath, "backend-errors.log");
                    var text = $"[{DateTime.UtcNow:O}] {context.Request.Method} {context.Request.Path} - {ex}\n";
                    File.AppendAllText(file, text);
                }
                catch { }

                // If the response already started we cannot modify it (setting StatusCode will throw).
                if (context.Response.HasStarted)
                {
                    // In development, rethrow so DeveloperExceptionPage can show details when possible.
                    if (_env.IsDevelopment())
                    {
                        throw;
                    }

                    // Otherwise, just return after logging.
                    return;
                }

                // In development, rethrow so the DeveloperExceptionPage can show detailed HTML.
                if (_env.IsDevelopment())
                {
                    throw;
                }

                context.Response.StatusCode = 500;
                await context.Response.WriteAsync("An internal server error occurred.");
            }
        }
    }
}
