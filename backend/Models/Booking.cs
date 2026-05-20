using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Booking
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }

        [Required]
        public int CourtId { get; set; }
        public Court Court { get; set; }

        [Required]
        public DateTime Start { get; set; }
        [Required]
        public DateTime End { get; set; }

        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
    }
}
