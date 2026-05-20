using System;
using Backend.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace backend
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowDev", builder =>
                {
                    builder.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
                });
            });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            var conn = Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=app.db";
            services.AddDbContext<AppDbContext>(options => options.UseSqlite(conn));
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            // Register exception logging as the very first middleware so it catches all exceptions
            app.UseMiddleware<Backend.Middleware.ExceptionLoggingMiddleware>();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // Ensure DB
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var db = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.EnsureCreated();
            }

            app.UseCors("AllowDev");
            app.UseMvc();
        }
    }
}
