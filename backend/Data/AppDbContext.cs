using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Court> Courts { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed locations
            modelBuilder.Entity<Location>().HasData(
                new Location { LocationId = 1, LocationName = "Gillies Avenue", Address = "Gillies Avenue, Auckland" }
            );

            // Seed courts
            modelBuilder.Entity<Court>().HasData(
                new Court { CourtId = 1, CourtName = "Court 1", Enabled = true, LocationId = 1 },
                new Court { CourtId = 2, CourtName = "Court 2", Enabled = true, LocationId = 1 }
            );
        }
    }
}
