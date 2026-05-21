using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Backend.Data;
using Backend.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // Handle CORS preflight requests
        [HttpOptions]
        [AllowAnonymous]
        public IActionResult Preflight()
        {
            return Ok();
        }

        [HttpOptions("login")]
        [AllowAnonymous]
        public IActionResult LoginPreflight()
        {
            return Ok();
        }

        [HttpOptions("register")]
        [AllowAnonymous]
        public IActionResult RegisterPreflight()
        {
            return Ok();
        }

        [HttpOptions("refresh")]
        [AllowAnonymous]
        public IActionResult RefreshPreflight()
        {
            return Ok();
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(new { error = "Username, email and password are required" });

                if (_db.Users.Any(u => u.Username == dto.Username))
                    return BadRequest(new { error = "Username already exists" });

                if (_db.Users.Any(u => u.Email == dto.Email))
                    return BadRequest(new { error = "Email already exists" });

                var user = new User
                {
                    Username = dto.Username,
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = "customer",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.Users.Add(user);
                _db.SaveChanges();

                return Ok(new { message = "Registration successful", user = new { user.Id, user.Username, user.Email, user.Role } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Registration failed", details = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                    return BadRequest(new { error = "Username and password are required" });

                var user = _db.Users.SingleOrDefault(u => u.Username == dto.Username || u.Email == dto.Username);
                if (user == null) return Unauthorized(new { error = "Username or email not found" });

                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) 
                    return Unauthorized(new { error = "Password is incorrect" });

                var accessToken = GenerateJwtToken(user);
                var minutes = int.TryParse(_config["Jwt:AccessTokenMinutes"], out var m) ? m : 15;

                // create refresh token
                var refreshToken = new RefreshToken
                {
                    Token = GenerateRefreshTokenString(),
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(int.TryParse(_config["Jwt:RefreshTokenDays"], out var d) ? d : 7)
                };
                _db.RefreshTokens.Add(refreshToken);
                _db.SaveChanges();

                // set cookies (httpOnly)
                var accessCookieOptions = new CookieOptions { HttpOnly = true, Expires = DateTime.UtcNow.AddMinutes(minutes), SameSite = SameSiteMode.Lax, Secure = false };
                Response.Cookies.Append("accessToken", accessToken, accessCookieOptions);

                var refreshCookieOptions = new CookieOptions { HttpOnly = true, Expires = refreshToken.ExpiresAt, SameSite = SameSiteMode.Lax, Secure = false };
                Response.Cookies.Append("refreshToken", refreshToken.Token, refreshCookieOptions);

                return Ok(new { message = "Login successful", user = new { user.Id, user.Username, user.Email, user.Role } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Login failed", details = ex.Message });
            }
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public IActionResult Refresh([FromBody] RefreshRequestDto dto)
        {
            var token = dto.RefreshToken;
            if (string.IsNullOrEmpty(token)) token = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(token)) return BadRequest("refreshToken required");

            var rt = _db.RefreshTokens.SingleOrDefault(r => r.Token == token);
            if (rt == null) return Unauthorized("Invalid refresh token");
            if (rt.Revoked || rt.ExpiresAt < DateTime.UtcNow) return Unauthorized("Refresh token expired or revoked");

            var user = _db.Users.SingleOrDefault(u => u.Id == rt.UserId);
            if (user == null) return Unauthorized("User not found");

            // revoke old refresh token
            rt.Revoked = true;

            // create new refresh token
            var newRefreshToken = new RefreshToken
            {
                Token = GenerateRefreshTokenString(),
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(int.TryParse(_config["Jwt:RefreshTokenDays"], out var d) ? d : 7)
            };
            _db.RefreshTokens.Add(newRefreshToken);
            _db.SaveChanges();

            var accessToken = GenerateJwtToken(user);
            var minutes = int.TryParse(_config["Jwt:AccessTokenMinutes"], out var m) ? m : 15;

            // update access token cookie
            var accessCookieOptions = new CookieOptions { HttpOnly = true, Expires = DateTime.UtcNow.AddMinutes(minutes), SameSite = SameSiteMode.Lax, Secure = false };
            Response.Cookies.Append("accessToken", accessToken, accessCookieOptions);

            // update refresh token cookie with new token
            var refreshCookieOptions = new CookieOptions { HttpOnly = true, Expires = newRefreshToken.ExpiresAt, SameSite = SameSiteMode.Lax, Secure = false };
            Response.Cookies.Append("refreshToken", newRefreshToken.Token, refreshCookieOptions);

            return Ok(new { user = new { user.Id, user.Username, user.Email, user.Role } });
        }

        [HttpPost("logout")]
        public IActionResult Logout([FromBody] LogoutDto dto)
        {
            var token = dto.RefreshToken;
            if (string.IsNullOrEmpty(token)) token = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(token))
            {
                var rt = _db.RefreshTokens.SingleOrDefault(r => r.Token == token);
                if (rt != null)
                {
                    rt.Revoked = true;
                    _db.SaveChanges();
                }
            }

            // delete cookies
            Response.Cookies.Delete("accessToken");
            Response.Cookies.Delete("refreshToken");

            return Ok();
        }

        private string GenerateJwtToken(User user)
        {
            var keyStr = _config["Jwt:Key"] ?? "dev-secret-change-me";
            var issuer = _config["Jwt:Issuer"] ?? "SportsHub";
            var audience = _config["Jwt:Audience"] ?? "SportsHub";
            var minutes = int.TryParse(_config["Jwt:AccessTokenMinutes"], out var m) ? m : 15;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(issuer, audience, claims, expires: DateTime.UtcNow.AddMinutes(minutes), signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshTokenString()
        {
            return Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        }

        public class RegisterDto { public string Username { get; set; } = ""; public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
        public class LoginDto { public string Username { get; set; } = ""; public string Password { get; set; } = ""; }
        public class RefreshRequestDto { public string RefreshToken { get; set; } = ""; }
        public class LogoutDto { public string RefreshToken { get; set; } = ""; }
    }
}
