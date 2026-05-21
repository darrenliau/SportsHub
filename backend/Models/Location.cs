using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Location
    {
        [Key]
        public int LocationId { get; set; }

        [Required]
        public string LocationName { get; set; }

        public string Address { get; set; }

        public ICollection<Court> Courts { get; set; }
    }
}
