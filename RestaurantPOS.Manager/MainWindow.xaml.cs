using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management;
using System.Net.NetworkInformation;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Threading;
using Path = System.IO.Path;

namespace RestaurantPOS.Manager
{
    public partial class MainWindow : Window
    {
        private DispatcherTimer _monitorTimer;
        private string _rootDirectory = string.Empty;
        private PerformanceCounter? _cpuCounter;
        private PerformanceCounter? _ramCounter;
        private float _totalRamMb;

        public MainWindow()
        {
            InitializeComponent();
            _monitorTimer = new DispatcherTimer();
            InitializeSystem();
        }

        private void InitializeSystem()
        {
            // Find root directory
            string? currentDir = AppDomain.CurrentDomain.BaseDirectory;
            DirectoryInfo? dir = new DirectoryInfo(currentDir);
            while (dir != null && !File.Exists(Path.Combine(dir.FullName, "RestaurantPOS.sln")))
            {
                dir = dir.Parent;
            }

            if (dir != null)
            {
                _rootDirectory = dir.FullName;
                Log($"Root directory found: {_rootDirectory}");
            }
            else
            {
                Log("Error: Could not find solution root directory.");
                _rootDirectory = currentDir ?? string.Empty;
            }

            // Initialize Performance Counters
            try
            {
                _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
                _ramCounter = new PerformanceCounter("Memory", "Available MBytes");
                
                // Get Total RAM
                long totalMemory = 0;
                using (var mc = new ManagementClass("Win32_ComputerSystem"))
                {
                    foreach (ManagementObject mo in mc.GetInstances())
                    {
                        if (mo["TotalPhysicalMemory"] != null)
                        {
                            totalMemory = Convert.ToInt64(mo["TotalPhysicalMemory"]);
                        }
                    }
                }
                _totalRamMb = totalMemory / (1024 * 1024);
                Log($"Total RAM detected: {_totalRamMb} MB");
            }
            catch (Exception ex)
            {
                Log($"Warning: Could not initialize performance counters. {ex.Message}");
            }

            // Setup Timer
            _monitorTimer.Interval = TimeSpan.FromSeconds(2);
            _monitorTimer.Tick += MonitorTimer_Tick;
            _monitorTimer.Start();

            Log("System Monitor started.");
            CheckStatus();
        }

        private void MonitorTimer_Tick(object? sender, EventArgs e)
        {
            CheckStatus();
        }


        private async void CheckStatus()
        {
            // Check API (Port 5000)
            bool apiRunning = IsPortInUse(5000);
            UpdateStatus(ApiStatusIndicator, ApiStatusText, apiRunning, "Running", "Stopped");

            // Check Web Client (Port 5173)
            bool webRunning = IsPortInUse(5173);
            UpdateStatus(WebStatusIndicator, WebStatusText, webRunning, "Running", "Stopped");

            // Update System Info
            int processCount = Process.GetProcesses().Length;
            ActiveProcessCount.Text = $"Active Processes: {processCount}";

            // Update CPU & RAM
            UpdatePerformanceCounters();
        }

        private void UpdatePerformanceCounters()
        {
             if (_cpuCounter != null && _ramCounter != null)
            {
                // Run in background to avoid UI freeze
                Task.Run(() =>
                {
                    try
                    {
                        float cpuUsage = _cpuCounter.NextValue();
                        float availableRam = _ramCounter.NextValue();
                        
                        // Update UI on Dispatcher
                        Application.Current.Dispatcher.Invoke(() =>
                        {
                            // If total RAM is 0 (failed to get), assume 16GB for calculation or just show 0
                            float totalRam = _totalRamMb > 0 ? _totalRamMb : 16384; 
                            
                            float usedRam = totalRam - availableRam;
                            float ramUsagePercent = (usedRam / totalRam) * 100;

                            CpuProgressBar.Value = cpuUsage;
                            CpuUsageText.Text = $"{cpuUsage:0}%";

                            RamProgressBar.Value = ramUsagePercent;
                            RamUsageText.Text = $"{ramUsagePercent:0}%";
                            
                            RamProgressBar.ToolTip = $"{availableRam:0} MB Available / {totalRam:0} MB Total";
                        });
                    }
                    catch (Exception ex)
                    {
                        // Log error to debug console but don't crash
                        Debug.WriteLine($"Performance Counter Error: {ex.Message}");
                    }
                });
            }
        }

        private void UpdateStatus(Ellipse indicator, TextBlock text, bool isRunning, string runningText, string stoppedText)
        {
            if (isRunning)
            {
                indicator.Fill = new SolidColorBrush(Color.FromRgb(16, 185, 129)); // Green
                text.Text = runningText;
                text.Foreground = new SolidColorBrush(Color.FromRgb(16, 185, 129));
            }
            else
            {
                indicator.Fill = new SolidColorBrush(Color.FromRgb(239, 68, 68)); // Red
                text.Text = stoppedText;
                text.Foreground = new SolidColorBrush(Color.FromRgb(239, 68, 68));
            }
        }

        private bool IsPortInUse(int port)
        {
            try
            {
                IPGlobalProperties ipGlobalProperties = IPGlobalProperties.GetIPGlobalProperties();
                TcpConnectionInformation[] tcpConnInfoArray = ipGlobalProperties.GetActiveTcpConnections();

                foreach (TcpConnectionInformation tcpi in tcpConnInfoArray)
                {
                    if (tcpi.LocalEndPoint.Port == port)
                    {
                        return true;
                    }
                }
                
                System.Net.IPEndPoint[] listeners = ipGlobalProperties.GetActiveTcpListeners();
                foreach (System.Net.IPEndPoint ep in listeners)
                {
                    if (ep.Port == port)
                    {
                        return true;
                    }
                }
            }
            catch { }

            return false;
        }

        private void Log(string message)
        {
            if (TxtLogs != null)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    TxtLogs.Text += $"[{DateTime.Now:HH:mm:ss}] {message}\n";
                    LogScrollViewer?.ScrollToEnd();
                });
            }
        }

        private void Nav_Click(object sender, RoutedEventArgs e)
        {
            if (sender is RadioButton rb && rb.Tag is string viewName)
            {
                View_Dashboard.Visibility = Visibility.Collapsed;
                View_Services.Visibility = Visibility.Collapsed;
                View_Database.Visibility = Visibility.Collapsed;
                View_Maintenance.Visibility = Visibility.Collapsed;

                switch (viewName)
                {
                    case "Dashboard": View_Dashboard.Visibility = Visibility.Visible; break;
                    case "Services": View_Services.Visibility = Visibility.Visible; break;
                    case "Database": View_Database.Visibility = Visibility.Visible; break;
                    case "Maintenance": View_Maintenance.Visibility = Visibility.Visible; break;
                }
            }
        }

        // Event Handlers

        private void BtnStartApi_Click(object sender, RoutedEventArgs e)
        {
            Log("Starting API...");
            StartProcess("dotnet", "run --launch-profile LAN", Path.Combine(_rootDirectory, "RestaurantPOS.API"), true);
        }

        private void BtnStopApi_Click(object sender, RoutedEventArgs e)
        {
            Log("Stopping API...");
            KillProcessByPort(5000);
        }

        private void BtnStartWeb_Click(object sender, RoutedEventArgs e)
        {
            Log("Starting Web Client...");
            // Use cmd /c to run npm, which is more robust on Windows when UseShellExecute is false
            StartProcess("cmd.exe", "/c npm run dev", Path.Combine(_rootDirectory, "restaurant-pos-client"), true);
        }

        private void BtnStopWeb_Click(object sender, RoutedEventArgs e)
        {
            Log("Stopping Web Client...");
            KillProcessByPort(5173);
        }

        private void BtnStartTunnel_Click(object sender, RoutedEventArgs e)
        {
            Log("Starting SePay Tunnel...");
            // Use -NoExit to keep the window open so user can see the URL
            StartProcess("powershell", "-NoExit -ExecutionPolicy Bypass -File start-tunnel.ps1", _rootDirectory, false);
        }

        private void BtnSimulateSePay_Click(object sender, RoutedEventArgs e)
        {
            Log("Launching SePay Simulator...");
            // Use -NoExit to keep the window open so user can see the result
            StartProcess("powershell", "-NoExit -ExecutionPolicy Bypass -File simulate-sepay.ps1", _rootDirectory, false);
        }

        private void BtnStartDesktop_Click(object sender, RoutedEventArgs e)
        {
            Log("Launching Desktop App...");
            string desktopExe = Path.Combine(_rootDirectory, "RestaurantPOS.Desktop", "bin", "Debug", "net8.0-windows", "RestaurantPOS.Desktop.exe");
            if (File.Exists(desktopExe))
            {
                 Process.Start(new ProcessStartInfo
                 {
                     FileName = desktopExe,
                     WorkingDirectory = Path.GetDirectoryName(desktopExe),
                     UseShellExecute = true
                 });
            }
            else
            {
                Log("Desktop executable not found. Trying to build/run via dotnet...");
                StartProcess("dotnet", "run --project RestaurantPOS.Desktop", _rootDirectory, true);
            }
        }

        private void BtnStopAll_Click(object sender, RoutedEventArgs e)
        {
            Log("Stopping all services...");
            KillProcessByPort(5000);
            KillProcessByPort(5173);
            // Also try to kill by name if ports fail or for other processes
            KillProcessByName("RestaurantPOS.Desktop");
        }

        private void BtnUpdateDb_Click(object sender, RoutedEventArgs e)
        {
            Log("Updating Database...");
            StartProcess("dotnet", "ef database update --project RestaurantPOS.API", _rootDirectory, true);
        }

        private void BtnSeedDb_Click(object sender, RoutedEventArgs e)
        {
            Log("Seeding Database...");
            StartProcess("dotnet", "run --project RestaurantPOS.API --seed", _rootDirectory, true);
        }

        private async void BtnInstallDeps_Click(object sender, RoutedEventArgs e)
        {
            Log("Installing Dependencies...");
            await Task.Run(() =>
            {
                try
                {
                    // Backend
                    Application.Current.Dispatcher.Invoke(() => Log("Restoring .NET packages..."));
                    var psiDotnet = new ProcessStartInfo
                    {
                        FileName = "dotnet",
                        Arguments = "restore",
                        WorkingDirectory = _rootDirectory,
                        UseShellExecute = true,
                        CreateNoWindow = false
                    };
                    Process.Start(psiDotnet)?.WaitForExit();

                    // Frontend
                    Application.Current.Dispatcher.Invoke(() => Log("Installing NPM packages..."));
                    var psiNpm = new ProcessStartInfo
                    {
                        FileName = "npm",
                        Arguments = "install",
                        WorkingDirectory = Path.Combine(_rootDirectory, "restaurant-pos-client"),
                        UseShellExecute = true,
                        CreateNoWindow = false
                    };
                    Process.Start(psiNpm)?.WaitForExit();

                    Application.Current.Dispatcher.Invoke(() => Log("Dependencies installed successfully."));
                }
                catch (Exception ex)
                {
                    Application.Current.Dispatcher.Invoke(() => Log($"Error installing dependencies: {ex.Message}"));
                }
            });
        }

        private async void BtnBuildProd_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("This will build the project for production. Continue?", "Build Production", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes)
            {
                return;
            }

            Log("Starting Production Build...");
            await Task.Run(() =>
            {
                try
                {
                    string distDir = Path.Combine(_rootDirectory, "dist");
                    if (Directory.Exists(distDir)) Directory.Delete(distDir, true);
                    Directory.CreateDirectory(distDir);

                    // 1. Build Frontend
                    Application.Current.Dispatcher.Invoke(() => Log("Building Frontend (React)..."));
                    string frontendDir = Path.Combine(_rootDirectory, "restaurant-pos-client");
                    // Use cmd to run npm to ensure it works in all environments
                    var psiNpm = new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = "/c npm run build",
                        WorkingDirectory = frontendDir,
                        UseShellExecute = true,
                        CreateNoWindow = false
                    };
                    Process.Start(psiNpm)?.WaitForExit();
                    
                    // Copy Frontend
                    string frontendDist = Path.Combine(frontendDir, "dist");
                    string targetFrontend = Path.Combine(distDir, "frontend");
                    if (Directory.Exists(frontendDist))
                    {
                        Directory.CreateDirectory(targetFrontend);
                        // Simple copy directory
                        foreach (string dirPath in Directory.GetDirectories(frontendDist, "*", SearchOption.AllDirectories))
                        {
                            Directory.CreateDirectory(dirPath.Replace(frontendDist, targetFrontend));
                        }
                        foreach (string newPath in Directory.GetFiles(frontendDist, "*.*", SearchOption.AllDirectories))
                        {
                            File.Copy(newPath, newPath.Replace(frontendDist, targetFrontend), true);
                        }
                        Application.Current.Dispatcher.Invoke(() => Log("Frontend build copied."));
                    }

                    // 2. Build Backend
                    Application.Current.Dispatcher.Invoke(() => Log("Building Backend (.NET)..."));
                    string apiDir = Path.Combine(_rootDirectory, "RestaurantPOS.API");
                    string publishDir = Path.Combine(apiDir, "publish");
                    if (Directory.Exists(publishDir)) Directory.Delete(publishDir, true);

                    var psiDotnet = new ProcessStartInfo
                    {
                        FileName = "dotnet",
                        Arguments = "publish -c Release -o publish",
                        WorkingDirectory = apiDir,
                        UseShellExecute = true,
                        CreateNoWindow = false
                    };
                    Process.Start(psiDotnet)?.WaitForExit();

                    // Copy Backend
                    string targetBackend = Path.Combine(distDir, "backend");
                    if (Directory.Exists(publishDir))
                    {
                        Directory.CreateDirectory(targetBackend);
                        foreach (string dirPath in Directory.GetDirectories(publishDir, "*", SearchOption.AllDirectories))
                        {
                            Directory.CreateDirectory(dirPath.Replace(publishDir, targetBackend));
                        }
                        foreach (string newPath in Directory.GetFiles(publishDir, "*.*", SearchOption.AllDirectories))
                        {
                            File.Copy(newPath, newPath.Replace(publishDir, targetBackend), true);
                        }
                        Application.Current.Dispatcher.Invoke(() => Log("Backend build copied."));
                    }

                    Application.Current.Dispatcher.Invoke(() => Log($"Build Complete! Output: {distDir}"));
                    Process.Start("explorer.exe", distDir);
                }
                catch (Exception ex)
                {
                    Application.Current.Dispatcher.Invoke(() => Log($"Build Error: {ex.Message}"));
                }
            });
        }

        private void BtnEditConfig_Click(object sender, RoutedEventArgs e)
        {
            string configPath = Path.Combine(_rootDirectory, "RestaurantPOS.API", "appsettings.json");
            if (File.Exists(configPath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "notepad.exe",
                    Arguments = configPath,
                    UseShellExecute = true
                });
                Log("Opened appsettings.json");
            }
            else
            {
                Log("Config file not found.");
            }
        }

        private async void BtnClean_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("Are you sure you want to clean the project? This will delete build artifacts and node_modules.", "Confirm Clean", MessageBoxButton.YesNo, MessageBoxImage.Warning) != MessageBoxResult.Yes)
            {
                return;
            }

            Log("Cleaning project...");
            await Task.Run(() =>
            {
                try
                {
                    // Frontend
                    string frontendDir = Path.Combine(_rootDirectory, "restaurant-pos-client");
                    DeleteDirectory(Path.Combine(frontendDir, "node_modules"));
                    DeleteDirectory(Path.Combine(frontendDir, ".vite"));
                    DeleteDirectory(Path.Combine(frontendDir, "dist"));
                    DeleteFile(Path.Combine(frontendDir, "package-lock.json"));

                    // Backend
                    string apiDir = Path.Combine(_rootDirectory, "RestaurantPOS.API");
                    DeleteDirectory(Path.Combine(apiDir, "bin"));
                    DeleteDirectory(Path.Combine(apiDir, "obj"));
                    
                    // Manager
                    string managerDir = Path.Combine(_rootDirectory, "RestaurantPOS.Manager");
                    DeleteDirectory(Path.Combine(managerDir, "bin"));
                    DeleteDirectory(Path.Combine(managerDir, "obj"));

                    // Desktop
                    string desktopDir = Path.Combine(_rootDirectory, "RestaurantPOS.Desktop");
                    DeleteDirectory(Path.Combine(desktopDir, "bin"));
                    DeleteDirectory(Path.Combine(desktopDir, "obj"));

                    // Root
                    DeleteDirectory(Path.Combine(_rootDirectory, ".vs"));
                    
                    Application.Current.Dispatcher.Invoke(() => Log("Cleanup completed successfully."));
                }
                catch (Exception ex)
                {
                    Application.Current.Dispatcher.Invoke(() => Log($"Error during cleanup: {ex.Message}"));
                }
            });
        }

        private void BtnFirewall_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("This action requires Administrator privileges. Continue?", "Setup Firewall", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                Log("Setting up firewall...");
                SetupFirewallRules();
            }
        }

        private void BtnSwagger_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:5000/swagger",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                Log($"Error opening Swagger: {ex.Message}");
            }
        }

        // Helper Methods

        private void StartProcess(string fileName, string arguments, string workingDirectory, bool hidden = false)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = fileName,
                    Arguments = arguments,
                    WorkingDirectory = workingDirectory,
                    UseShellExecute = !hidden,
                    CreateNoWindow = hidden,
                    RedirectStandardOutput = hidden,
                    RedirectStandardError = hidden
                };

                var process = new Process { StartInfo = psi };

                if (hidden)
                {
                    process.OutputDataReceived += (sender, e) =>
                    {
                        if (!string.IsNullOrEmpty(e.Data)) Log($"{fileName}: {e.Data}");
                    };
                    process.ErrorDataReceived += (sender, e) =>
                    {
                        if (!string.IsNullOrEmpty(e.Data)) Log($"{fileName} Error: {e.Data}");
                    };
                }

                process.Start();

                if (hidden)
                {
                    process.BeginOutputReadLine();
                    process.BeginErrorReadLine();
                }

                Log($"Started: {fileName} {arguments}");
            }
            catch (Exception ex)
            {
                Log($"Error starting process: {ex.Message}");
            }
        }

        private void KillProcessByPort(int port)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/c for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :{port} ^| findstr LISTENING') do taskkill /F /PID %a",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true
                };
                Process? p = Process.Start(psi);
                p?.WaitForExit();
                Log($"Attempted to kill process on port {port}");
            }
            catch (Exception ex)
            {
                Log($"Error killing process: {ex.Message}");
            }
        }

        private void KillProcessByName(string processName)
        {
            try
            {
                foreach (var process in Process.GetProcessesByName(processName))
                {
                    process.Kill();
                    Log($"Killed process: {processName}");
                }
            }
            catch { }
        }

        private void DeleteDirectory(string path)
        {
            if (Directory.Exists(path))
            {
                try
                {
                    Directory.Delete(path, true);
                    Application.Current.Dispatcher.Invoke(() => Log($"Deleted directory: {path}"));
                }
                catch (Exception ex)
                {
                    Application.Current.Dispatcher.Invoke(() => Log($"Failed to delete {path}: {ex.Message}"));
                }
            }
        }

        private void DeleteFile(string path)
        {
            if (File.Exists(path))
            {
                try
                {
                    File.Delete(path);
                    Application.Current.Dispatcher.Invoke(() => Log($"Deleted file: {path}"));
                }
                catch (Exception ex)
                {
                    Application.Current.Dispatcher.Invoke(() => Log($"Failed to delete {path}: {ex.Message}"));
                }
            }
        }

        private void SetupFirewallRules()
        {
            string[] commands = new[]
            {
                "advfirewall firewall delete rule name=\"Restaurant POS API\"",
                "advfirewall firewall delete rule name=\"Restaurant POS API HTTPS\"",
                "advfirewall firewall delete rule name=\"Restaurant POS Client\"",
                "advfirewall firewall add rule name=\"Restaurant POS API\" dir=in action=allow protocol=TCP localport=5000 profile=any description=\"Allow inbound connections to Restaurant POS API (HTTP)\"",
                "advfirewall firewall add rule name=\"Restaurant POS API HTTPS\" dir=in action=allow protocol=TCP localport=7000 profile=any description=\"Allow inbound connections to Restaurant POS API (HTTPS)\"",
                "advfirewall firewall add rule name=\"Restaurant POS Client\" dir=in action=allow protocol=TCP localport=5173 profile=any description=\"Allow inbound connections to Restaurant POS Client (Vite)\""
            };

            Task.Run(() =>
            {
                foreach (var cmd in commands)
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo
                        {
                            FileName = "netsh",
                            Arguments = cmd,
                            UseShellExecute = true,
                            Verb = "runas", // Request Admin privileges
                            CreateNoWindow = true,
                            WindowStyle = ProcessWindowStyle.Hidden
                        };
                        Process? p = Process.Start(psi);
                        p?.WaitForExit();
                        Application.Current.Dispatcher.Invoke(() => Log($"Executed firewall command: {cmd}"));
                    }
                    catch (Exception ex)
                    {
                        Application.Current.Dispatcher.Invoke(() => Log($"Firewall setup error: {ex.Message}"));
                    }
                }
                Application.Current.Dispatcher.Invoke(() => Log("Firewall setup finished."));
            });
        }
    }
}