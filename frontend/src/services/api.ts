export async function fetchBookings() {
  const res = await fetch('http://localhost:5000/api/bookings');
  return await res.json();
}

export async function fetchCourts() {
  const res = await fetch('http://localhost:5000/api/courts');
  return await res.json();
}

export async function createBooking(payload: any) {
  const res = await fetch('http://localhost:5000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function updateBooking(id: any, payload: any) {
  const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function deleteBooking(id: any) {
  const res = await fetch(`http://localhost:5000/api/bookings/${id}`, { method: 'DELETE' });
  if (!res.ok) throw res;
  return true;
}
