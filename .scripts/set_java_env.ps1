# Verify current java/jdk installs
Get-ChildItem 'C:\Program Files\Java' -Directory
where.exe java
java -version

# Set this to your installed JDK folder (use an LTS JDK like 17 or 11)
$jdk = 'C:\Program Files\Java\jdk-25'
if (-not (Test-Path $jdk)) { Write-Error "JDK not found at $jdk; update $jdk variable and re-run"; return }

# Persist machine-level env vars (requires admin)
[Environment]::SetEnvironmentVariable('JAVA_HOME', $jdk, 'Machine')
$mp = [Environment]::GetEnvironmentVariable('PATH','Machine')
if ($mp -notlike "$($jdk)\bin*") {
  [Environment]::SetEnvironmentVariable('PATH', "$($jdk)\bin;$mp", 'Machine')
}

# Clear problematic JVM options persistently
[Environment]::SetEnvironmentVariable('_JAVA_OPTIONS', $null, 'Machine')
[Environment]::SetEnvironmentVariable('JAVA_TOOL_OPTIONS', $null, 'Machine')

Write-Output "MACHINE_ENV_UPDATED"

# Make changes visible in the current session immediately
$env:JAVA_HOME = $jdk
$env:PATH = "$($jdk)\bin;" + $env:PATH
Remove-Item Env:_JAVA_OPTIONS -ErrorAction SilentlyContinue
Remove-Item Env:JAVA_TOOL_OPTIONS -ErrorAction SilentlyContinue

# Verify results
where.exe java
java -version
[Environment]::GetEnvironmentVariable('JAVA_HOME','Machine')

# From project root, run gradle check
& .\gradlew.bat --version