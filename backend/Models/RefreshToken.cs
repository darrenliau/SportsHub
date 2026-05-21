using System;

namespace Backend.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool Revoked { get; set; } = false;
        public DateTime CreatedAt { get; set; }
    }
}
