using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class CourtBlackoutDate
    {
        [Key]
        public int BlackoutDateId { get; set; }

        [Required]
        [ForeignKey("Court")]
        public int CourtId { get; set; }

        [Required]
        public DateTime DateStart { get; set; }

        [Required]
        public DateTime DateEnd { get; set; }

        public string Reason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public Court Court { get; set; }
    }
}
