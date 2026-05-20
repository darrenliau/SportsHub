using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Court
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }

        public ICollection<Booking> Bookings { get; set; }
    }
}
