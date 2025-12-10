using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace RestaurantPOS.LoadTest
{
    class Program
    {
        private static readonly HttpClient _client = new HttpClient(); // Reuse client
        private static string _baseUrl = "http://localhost:5000/api";
        private static string _token = "";
        
        // Stats
        private static int _activeUsers = 0;
        private static long _totalRequests = 0;
        private static long _failedRequests = 0;
        private static ConcurrentBag<long> _latencySnapshot = new ConcurrentBag<long>();

        static async Task Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.WriteLine("==========================================");
            Console.WriteLine("🚀  RESTAURANT POS - STRESS & LOAD TEST TOOL");
            Console.WriteLine("==========================================");
            Console.WriteLine($"Target API: {_baseUrl}");

            // 1. Setup User
            Console.Write("\n[1] Connecting to API... ");
            if (!await SetupUserAsync())
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("FAILED! (Make sure API is running)");
                Console.ResetColor();
                return;
            }
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("OK! (Admin Token Acquired)");
            Console.ResetColor();

            // 2. Select Mode
            Console.WriteLine("\nSelect Test Mode:");
            Console.WriteLine("1. Basic Stress Test (Fixed Concurrency)");
            Console.WriteLine("2. Peak Hour Simulation (Ramp-up Traffic)");
            Console.Write("Choice (1/2): ");
            var choice = Console.ReadLine();

            if (choice == "2")
            {
                await RunPeakHourSimulation();
            }
            else
            {
                await RunBasicStressTest();
            }

            Console.WriteLine("\nTest Completed. Press any key to exit.");
            Console.WriteLine("\nTest Completed.");
        }

        static async Task RunPeakHourSimulation()
        {
            Console.Clear();
            Console.WriteLine("=== 📈 PEAK HOUR SIMULATION ===");
            Console.WriteLine("Scenario: 80% View Menu | 15% Order | 5% Pay");
            Console.WriteLine("Pattern: Ramp-up 10 users every 5s -> Hold Max -> Ramp-down");
            
            int maxUsers = 100;
            int rampUpSteps = 10;
            int stepDelayMs = 5000; // 5s
            int holdDurationMs = 30000; // 30s
            
            var cts = new CancellationTokenSource();
            
            // Start Monitor Task
            var monitorTask = Task.Run(() => MonitorStats(cts.Token));
            
            var userTasks = new List<Task>();

            // PHASE 1: RAMP UP
            for (int i = 0; i < rampUpSteps; i++)
            {
                int usersToAdd = maxUsers / rampUpSteps;
                Console.WriteLine($"\n[RAMP-UP] Adding {usersToAdd} users... (Total: {_activeUsers + usersToAdd})");
                
                for (int u = 0; u < usersToAdd; u++)
                {
                    userTasks.Add(Task.Run(() => SimulateSmartUser(cts.Token)));
                    Interlocked.Increment(ref _activeUsers);
                }
                await Task.Delay(stepDelayMs);
            }

            // PHASE 2: HOLD
            Console.WriteLine($"\n[HOLD] Sustaining load with {_activeUsers} users for {holdDurationMs/1000}s...");
            await Task.Delay(holdDurationMs);

            // PHASE 3: STOP
            Console.WriteLine("\n[STOP] Stopping all users...");
            cts.Cancel();
            
            try 
            {
                await Task.WhenAll(userTasks); 
            } 
            catch (OperationCanceledException) {} // Expected

            await monitorTask;
        }

        static async Task RunBasicStressTest()
        {
            int concurrency = 50;
            Console.Write($"Enter concurrency (default 50): ");
            int.TryParse(Console.ReadLine(), out int input);
            if (input > 0) concurrency = input;

            Console.WriteLine($"Starting {concurrency} threads...");
            var tasks = new List<Task>();
            for(int i=0; i<concurrency; i++)
            {
                tasks.Add(Task.Run(async () => 
                {
                    for(int j=0; j<20; j++) // 20 actions each
                    {
                        await SimulateSmartUser(CancellationToken.None, singleRun: true);
                    }
                }));
            }
            await Task.WhenAll(tasks);
        }

        static async Task MonitorStats(CancellationToken token)
        {
            try
            {
                while (!token.IsCancellationRequested)
                {
                    await Task.Delay(1000, token);
                    
                    double avgLat = 0;
                    int sampleCount = 0;
                    while (_latencySnapshot.TryTake(out long lat))
                    {
                        avgLat += lat;
                        sampleCount++;
                    }
                    if (sampleCount > 0) avgLat /= sampleCount;

                    Console.WriteLine($"[Status] Users: {_activeUsers:D3} | reqs: {_totalRequests:D5} | Errs: {_failedRequests:D3} | Latency: {avgLat:F0}ms   ");
                }
            }
            catch (OperationCanceledException) 
            {
                // Normal exit
            }
            Console.WriteLine();
        }

        static Program()
        {
            _client.Timeout = TimeSpan.FromSeconds(5); // Fail fast after 5s
        }

        static async Task SimulateSmartUser(CancellationToken token, bool singleRun = false)
        {
            var random = new Random();
            
            while (!token.IsCancellationRequested)
            {
                var sw = Stopwatch.StartNew();
                bool success = false;
                
                // Behavior Mix
                int dice = random.Next(100);
                
                try
                {
                    if (dice < 80) // 80% Read (Menu, Tables)
                    {
                        await _client.GetAsync($"{_baseUrl}/Categories", token);
                        await _client.GetAsync($"{_baseUrl}/Tables", token);
                        success = true;
                    }
                    else if (dice < 95) // 15% Order (Write)
                    {
                         var orderPayload = new { TableId = 1, OrderItems = new[] { new { ProductId = 1, Quantity = 1 } } };
                         // We don't await result body to keep it light, just status
                         var res = await _client.PostAsJsonAsync($"{_baseUrl}/Orders", orderPayload, token);
                         success = res.IsSuccessStatusCode;
                    }
                    else // 5% Check (Write Heavy - if implemented) or User Info
                    {
                        var res = await _client.GetAsync($"{_baseUrl}/Auth/me", token);
                        success = res.IsSuccessStatusCode;
                    }
                }
                catch
                {
                    success = false;
                }
                
                sw.Stop();
                
                // Stats update
                Interlocked.Increment(ref _totalRequests);
                if (!success) Interlocked.Increment(ref _failedRequests);
                _latencySnapshot.Add(sw.ElapsedMilliseconds);

                if (singleRun) break;

                // Think time (delay between actions)
                await Task.Delay(random.Next(500, 2000), token); // 0.5s - 2s delay
            }
        }

        private static async Task<bool> SetupUserAsync()
        {
            try
            {
                var username = $"stress_{Guid.NewGuid().ToString().Substring(0,8)}";
                var registerData = new { Username = username, Password = "Password123!", Email = $"{username}@test.com", FullName = "Tester", Role = "Admin" };
                await _client.PostAsJsonAsync($"{_baseUrl}/Auth/register", registerData);
                
                var loginData = new { Username = username, Password = "Password123!" };
                var res = await _client.PostAsJsonAsync($"{_baseUrl}/Auth/login", loginData);
                
                if (res.IsSuccessStatusCode)
                {
                    var content = await res.Content.ReadAsStringAsync();
                    dynamic? json = JsonConvert.DeserializeObject(content);
                    string? token = json?.token;
                    if (string.IsNullOrEmpty(token)) return false;
                    
                    _token = token;
                    _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _token);
                    return true;
                }
            }
            catch {}
            return false;
        }
    }
}
