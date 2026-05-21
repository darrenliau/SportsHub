using System;
using Backend.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
                    builder.WithOrigins("http://localhost:5173", "http://localhost:5174").AllowAnyHeader().AllowAnyMethod();
                });
            });

            services.AddMvc(options => { })
                .AddJsonOptions(opts => 
                {
                    opts.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                })
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            var conn = Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=app.db";
            services.AddDbContext<AppDbContext>(options => options.UseSqlite(conn));

            // JWT Authentication
            var key = Configuration["Jwt:Key"] ?? "dev-secret-change-me";
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ValidateIssuer = true,
                    ValidIssuer = Configuration["Jwt:Issuer"] ?? "SportsHub",
                    ValidateAudience = true,
                    ValidAudience = Configuration["Jwt:Audience"] ?? "SportsHub",
                    ValidateLifetime = true
                };

                // Allow token from cookie named 'accessToken' when Authorization header is absent
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Cookies["accessToken"];
                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            context.Token = accessToken;
                        }
                        return System.Threading.Tasks.Task.CompletedTask;
                    }
                };
            });
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
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
