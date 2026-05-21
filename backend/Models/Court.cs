using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Court
    {
        [Key]
        public int CourtId { get; set; }

        [Required]
        public string CourtName { get; set; }

        [Required]
        public bool Enabled { get; set; } = true;

        [Required]
        [ForeignKey("Location")]
        public int LocationId { get; set; }

        public Location Location { get; set; }

        public ICollection<Booking> Bookings { get; set; }
    }
}
