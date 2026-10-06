<#
.SYNOPSIS
  Set up held-out evaluation in a project, or update it, from this clone of the skill.

.DESCRIPTION
  Run it in the folder of the project that holds (or will hold) the tests, or point -Project at it:
    1. pulls this clone, so the project gets the latest skill (-NoPull to skip);
    2. checks Node (20.11 or newer);
    3. runs the skill's init: a new project is set up (-BaseUrl is needed), a set-up one is updated - the skill, its
       scripts, the subagents and the files it copied, except the ones the project changed; dependencies and Chromium
       are installed;
    4. runs doctor, which lists anything left to do with the command that does it.
  The same command updates a project later, on any machine, even one that has only a clone of the project.

.EXAMPLE
  & "$HOME/heldout-skill/setup.ps1" -BaseUrl https://your-app
.EXAMPLE
  & "$HOME/heldout-skill/setup.ps1"
.EXAMPLE
  & "$HOME/heldout-skill/setup.ps1" -Project D:\work\shop-qa -Ci gitlab
.EXAMPLE
  & "$HOME/heldout-skill/setup.ps1" -BaseUrl https://your-app --api-base-url https://api.your-app --name "Your App"
#>
[CmdletBinding()]
param(
  # The project's folder (default: the current one).
  [string]$Project = (Get-Location).Path,
  # The application's web address; needed the first time.
  [string]$BaseUrl,
  # Adds the regression pipeline: gitlab or github.
  [ValidateSet('gitlab', 'github')][string]$Ci,
  # Don't pull this clone first.
  [switch]$NoPull,
  # Anything else goes to init as it is (--api-base-url, --name, --profile, --test-id-attr, --data-prefix ...).
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$InitArgs
)
$ErrorActionPreference = 'Stop'
$skill = $PSScriptRoot
# Windows runs npm and npx through their .cmd shims, which the execution policy doesn't block.
$onWindows = $env:OS -eq 'Windows_NT'
$npx = if ($onWindows) { 'npx.cmd' } else { 'npx' }
$npm = if ($onWindows) { 'npm.cmd' } else { 'npm' }

function Step([string]$text) { Write-Host "`n> $text" -ForegroundColor Cyan }

if (-not (Test-Path -LiteralPath $Project -PathType Container)) { throw "No folder $Project - create it first, or pass -Project <folder>." }
$Project = (Resolve-Path -LiteralPath $Project).Path
if ($Project.TrimEnd('\', '/') -eq $skill.TrimEnd('\', '/')) {
  throw 'This is the skill''s own clone: run setup in your project''s folder (or pass -Project <folder>).'
}

if (-not $NoPull -and (Test-Path -LiteralPath (Join-Path $skill '.git'))) {
  Step 'git pull (the skill)'
  & git -C $skill pull --ff-only
  if ($LASTEXITCODE -ne 0) { Write-Warning 'Could not pull the skill (offline, or local changes in the clone): going on with the copy as it is.' }
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw 'Node.js is not installed: install Node 20 LTS or newer (https://nodejs.org), then run setup again.' }
$version = (& node -p 'process.versions.node').Trim()
$parts = $version.Split('.') | ForEach-Object { [int]$_ }
if ($parts[0] -lt 20 -or ($parts[0] -eq 20 -and $parts[1] -lt 11)) { throw "Node $version is too old: install Node 20.11 or newer, then run setup again." }

$isNew = -not (Test-Path -LiteralPath (Join-Path $Project 'heldout.config.json'))
if ($isNew -and -not $BaseUrl) { throw 'A new project needs the application''s address: setup.ps1 -BaseUrl https://your-app' }

$initArgs = @('init', '--install')
if ($BaseUrl) { $initArgs += @('--base-url', $BaseUrl) }
if ($Ci) { $initArgs += @('--ci', $Ci) }
if ($InitArgs) { $initArgs += $InitArgs }

Push-Location -LiteralPath $Project
$env:HELDOUT_SETUP = '1'
try {
  Step $(if ($isNew) { "heldout init (a new project in $Project)" } else { "heldout init (updating $Project)" })
  & $npx -y tsx (Join-Path $skill '.github/scripts/heldout.ts') @initArgs
  if ($LASTEXITCODE -ne 0) { throw "init stopped (exit $LASTEXITCODE) - see above." }
  Step 'heldout doctor'
  & $npm run --silent heldout -- doctor
  exit $LASTEXITCODE
} finally {
  Remove-Item Env:HELDOUT_SETUP -ErrorAction SilentlyContinue
  Pop-Location
}
