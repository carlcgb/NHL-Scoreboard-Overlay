# Creates a public GitHub repo and pushes main (requires authentication).
# Option A — GitHub CLI (recommended after: gh auth login):
#   gh repo create NHL-Scoreboard-Overlay --public --source=. --remote=origin --push
#
# Option B — Personal access token with "repo" scope:
#   $env:GITHUB_TOKEN = "ghp_xxxxxxxx"
#   .\scripts\publish-github.ps1 -Owner "YourGitHubUsername"

param(
  [Parameter(Mandatory = $true)]
  [string] $Owner,
  [string] $RepoName = "NHL-Scoreboard-Overlay"
)

$ErrorActionPreference = "Stop"
$token = $env:GITHUB_TOKEN
if (-not $token) {
  Write-Error "Set GITHUB_TOKEN to a classic PAT with 'repo' scope, or use: gh auth login && gh repo create $RepoName --public --source=. --remote=origin --push"
  exit 1
}

$headers = @{
  Authorization = "Bearer $token"
  Accept        = "application/vnd.github+json"
}
$body = @{
  name        = $RepoName
  description = "NHL playoffs scoreboard browser overlay for OBS (Next.js)"
  private     = $false
} | ConvertTo-Json

try {
  Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
} catch {
  if ($_.Exception.Response.StatusCode -eq 422) {
    Write-Host "Repository may already exist; continuing to set remote and push."
  } else {
    throw
  }
}

Set-Location (Join-Path $PSScriptRoot "..")
if (-not (git remote get-url origin 2>$null)) {
  git remote add origin "https://github.com/$Owner/$RepoName.git"
} else {
  git remote set-url origin "https://github.com/$Owner/$RepoName.git"
}

git push -u origin main
