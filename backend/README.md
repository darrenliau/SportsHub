Backend (recommended steps)

1. Ensure .NET 8 SDK is installed.
2. Scaffold API: `dotnet new webapi -o backend`
3. Add EF Core and SQLite provider: `dotnet add backend package Microsoft.EntityFrameworkCore.Sqlite` and `dotnet add backend package Microsoft.EntityFrameworkCore.Design`
4. Add Dockerfile later for containerization.

Planned folders: Models/, Data/, Controllers/, Migrations/
