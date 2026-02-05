# Skill Naming Convention Validator
# Validates that skill names follow lowercase-hyphenated format

param(
    [Parameter(Mandatory=$false)]
    [string]$SkillName
)

$NamePattern = '^[a-z][a-z0-9]*(-[a-z0-9]+)*$'

function Test-SkillName {
    param([string]$Name)
    
    if ($Name -match $NamePattern) {
        Write-Host "✓ Valid skill name: $Name" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "✗ Invalid skill name: $Name" -ForegroundColor Red
        Write-Host "  Skill names must:" -ForegroundColor Yellow
        Write-Host "  - Start with lowercase letter" -ForegroundColor Yellow
        Write-Host "  - Use only lowercase letters, numbers, and hyphens" -ForegroundColor Yellow
        Write-Host "  - Not start or end with hyphen" -ForegroundColor Yellow
        Write-Host "  - Not have consecutive hyphens" -ForegroundColor Yellow
        Write-Host "`n  Examples:" -ForegroundColor Cyan
        Write-Host "  ✓ api-tester" -ForegroundColor Green
        Write-Host "  ✓ code-formatter" -ForegroundColor Green
        Write-Host "  ✓ skill-creator" -ForegroundColor Green
        Write-Host "  ✗ API-Tester (uppercase)" -ForegroundColor Red
        Write-Host "  ✗ code_formatter (underscore)" -ForegroundColor Red
        Write-Host "  ✗ -api-tester (starts with hyphen)" -ForegroundColor Red
        return $false
    }
}

# If skill name provided, validate it
if ($SkillName) {
    Test-SkillName $SkillName
}
else {
    # Validate all skills in repository
    Write-Host "Validating all skills in .github/skills/`n" -ForegroundColor Cyan
    
    $skills = Get-ChildItem -Path ".github/skills" -Directory -ErrorAction SilentlyContinue
    $allValid = $true
    
    foreach ($skill in $skills) {
        if (-not (Test-SkillName $skill.Name)) {
            $allValid = $false
        }
    }
    
    Write-Host "`n" -NoNewline
    if ($allValid) {
        Write-Host "All skill names are valid!" -ForegroundColor Green
    }
    else {
        Write-Host "Some skill names need correction." -ForegroundColor Red
    }
}
