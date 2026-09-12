All 5 Backend URLs — Safe Data Detection

Purpose: Check all 5 backend data APIs from Windows CMD using PowerShell.

Safety: The commands below do not print API records. They only print:

Backend name
Data endpoint that succeeded
HTTP status
DATA DETECTED / DATA NOT DETECTED
Actual records are never printed

Important: ?limit=1 is included as a request to the API. The backend should enforce the limit server-side if you need a hard guarantee against very large responses.

1. Flask
Confirmed working path
powershell -NoProfile -Command "$u='https://flask-restapi-tzdm.onrender.com/mobiles?limit=1'; try { $r=Invoke-WebRequest -Uri $u -Method Get -TimeoutSec 20; if([int]$r.StatusCode -ge 200 -and [int]$r.StatusCode -lt 300) { try { $null=$r.Content | ConvertFrom-Json; Write-Host '========================================'; Write-Host 'FLASK'; Write-Host '========================================'; Write-Host 'DATA         : DETECTED'; Write-Host 'ENDPOINT     : /mobiles'; Write-Host ('HTTP STATUS  : ' + [int]$r.StatusCode); Write-Host 'ACTUAL DATA  : NOT PRINTED'; Write-Host '========================================' } catch { Write-Host 'FLASK DATA NOT DETECTED - INVALID JSON' } } } catch { if($_.Exception.Response){ Write-Host 'FLASK DATA NOT DETECTED'; Write-Host ('HTTP STATUS  : ' + [int]$_.Exception.Response.StatusCode.value__) } else { Write-Host 'FLASK REQUEST FAILED' } }"

Flask fallback order
1. /api/mobiles
2. /mobiles          ← confirmed HTTP 200
3. /api/mobile
4. /mobile

2. Django
powershell -NoProfile -Command "$u='https://django-restapi-r7yj.onrender.com/api/tasks?limit=1'; try { $r=Invoke-WebRequest -Uri $u -Method Get -TimeoutSec 20; if([int]$r.StatusCode -ge 200 -and [int]$r.StatusCode -lt 300) { try { $null=$r.Content | ConvertFrom-Json; Write-Host '========================================'; Write-Host 'DJANGO'; Write-Host '========================================'; Write-Host 'DATA         : DETECTED'; Write-Host 'ENDPOINT     : /api/tasks'; Write-Host ('HTTP STATUS  : ' + [int]$r.StatusCode); Write-Host 'ACTUAL DATA  : NOT PRINTED'; Write-Host '========================================' } catch { Write-Host 'DJANGO DATA NOT DETECTED - INVALID JSON' } } } catch { if($_.Exception.Response){ Write-Host 'DJANGO DATA NOT DETECTED'; Write-Host ('HTTP STATUS  : ' + [int]$_.Exception.Response.StatusCode.value__) } else { Write-Host 'DJANGO REQUEST FAILED' } }"

Django path
/api/tasks

3. FastAPI
powershell -NoProfile -Command "$base='https://fastapi-rest-api.onrender.com'; $paths=@('/mobiles','/api/mobiles','/api/mobile','/mobile'); $found=$false; foreach($p in $paths) { if($found){break}; $u=$base+$p+'?limit=1'; try { $r=Invoke-WebRequest -Uri $u -Method Get -TimeoutSec 20; if([int]$r.StatusCode -ge 200 -and [int]$r.StatusCode -lt 300) { try { $null=$r.Content | ConvertFrom-Json; Write-Host '========================================'; Write-Host 'FASTAPI'; Write-Host '========================================'; Write-Host 'DATA         : DETECTED'; Write-Host ('ENDPOINT     : ' + $p); Write-Host ('HTTP STATUS  : ' + [int]$r.StatusCode); Write-Host 'ACTUAL DATA  : NOT PRINTED'; Write-Host '========================================'; $found=$true } catch {} } } catch {} }; if(-not $found){Write-Host '========================================'; Write-Host 'FASTAPI'; Write-Host '========================================'; Write-Host 'DATA         : NOT DETECTED'; Write-Host 'ALL DATA PATHS FAILED'; Write-Host 'ACTUAL DATA  : NOT PRINTED'; Write-Host '========================================'}"

FastAPI fallback order
1. /mobiles
2. /api/mobiles
3. /api/mobile
4. /mobile


The command stops immediately after the first successful 2xx + valid JSON response.

4. Java Spring Boot
powershell -NoProfile -Command "$u='https://java-springboot-user-backend.onrender.com/api/users?limit=1'; try { $r=Invoke-WebRequest -Uri $u -Method Get -TimeoutSec 20; if([int]$r.StatusCode -ge 200 -and [int]$r.StatusCode -lt 300) { try { $null=$r.Content | ConvertFrom-Json; Write-Host '========================================'; Write-Host 'JAVA SPRING BOOT'; Write-Host '========================================'; Write-Host 'DATA         : DETECTED'; Write-Host 'ENDPOINT     : /api/users'; Write-Host ('HTTP STATUS  : ' + [int]$r.StatusCode); Write-Host 'ACTUAL DATA  : NOT PRINTED'; Write-Host '========================================' } catch { Write-Host 'JAVA DATA NOT DETECTED - INVALID JSON' } } } catch { if($_.Exception.Response){ Write-Host 'JAVA DATA NOT DETECTED'; Write-Host ('HTTP STATUS  : ' + [int]$_.Exception.Response.StatusCode.value__) } else { Write-Host 'JAVA REQUEST FAILED' } }"

Java path
/api/users

5. ASP.NET Core (.NET)
powershell -NoProfile -Command "$base='https://dotnet-user-service-latest.onrender.com'; $paths=@('/api/users','/users','/api/user','/user'); $found=$false; foreach($p in $paths) { if($found){break}; $u=$base+$p+'?limit=1'; try { $r=Invoke-WebRequest -Uri $u -Method Get -TimeoutSec 20; if([int]$r.StatusCode -ge 200 -and [int]$r.StatusCode -lt 300) { try { $null=$r.Content | ConvertFrom-Json; Write-Host '========================================'; Write-Host '.NET'; Write-Host '========================================'; Write-Host 'DATA         : DETECTED'; Write-Host ('ENDPOINT     : ' + $p); Write-Host ('HTTP STATUS  : ' + [int]$r.StatusCode); Write-Host 'ACTUAL DATA  : NOT PRINTED'; Write-Host '========================================'; $found=$true } catch {} } } catch {} }; if(-not $found){Write-Host '========================================'; Write-Host '.NET'; Write-Host '========================================'; Write-Host 'DATA         : NOT DETECTED'; Write-Host 'ALL DATA PATHS FAILED'; Write-Host 'ACTUAL DATA  : NOT PRINTED'; Write-Host '========================================'}"

.NET fallback order
1. /api/users
2. /users
3. /api/user
4. /user

Expected Output

When a backend is healthy, the output will look like:

========================================
FLASK
========================================
DATA         : DETECTED
ENDPOINT     : /mobiles
HTTP STATUS  : 200
ACTUAL DATA  : NOT PRINTED
========================================


If no valid data endpoint is found:

========================================
FASTAPI
========================================
DATA         : NOT DETECTED
ALL DATA PATHS FAILED
ACTUAL DATA  : NOT PRINTED
========================================

Safety Rules
No API records are displayed.
No records are stored in PowerShell variables after JSON validation.
?limit=1 is sent to every endpoint.
A 404 path is skipped where fallback paths exist.
Only 2xx + valid JSON counts as DATA DETECTED.
The first successful data path is selected.
The actual JSON response is never written to the console.
For a true hard protection against APIs that ignore ?limit=1, the backend itself must enforce pagination/limits.