# Trigger Detection Script
# PowerShell script to detect user intent and automatically trigger skills

param(
    [Parameter(Mandatory=$true)]
    [string]$UserMessage
)

# Configuration
$SkillsPath = ".github/skills"
$ConfidenceThreshold = 0.80

# Preprocessing function
function Normalize-Input {
    param([string]$Input)
    
    $normalized = $Input.ToLower()
    $normalized = $normalized -replace '[^\w\s]', ' '  # Remove punctuation
    $normalized = $normalized -replace '\s+', ' '      # Collapse whitespace
    $normalized = $normalized.Trim()
    
    return $normalized
}

# Extract triggers from skill metadata
function Get-SkillTriggers {
    $skills = Get-ChildItem -Path $SkillsPath -Directory
    $triggerMap = @{}
    
    foreach ($skill in $skills) {
        $skillFile = Join-Path $skill.FullName "SKILL.md"
        if (Test-Path $skillFile) {
            $content = Get-Content $skillFile -Raw
            
            # Extract YAML frontmatter
            if ($content -match '(?s)^---\s*\n(.*?)\n---') {
                $yaml = $matches[1]
                
                # Simple YAML parsing for triggers
                if ($yaml -match 'triggers:\s*\n((?:\s+-\s+[^\n]+\n?)*)') {
                    $triggersBlock = $matches[1]
                    $triggers = $triggersBlock -split '\n' | Where-Object { $_ -match '^\s+-\s+(.+)' } | ForEach-Object {
                        $matches[1].Trim().Trim('"').Trim("'")
                    }
                    
                    $triggerMap[$skill.Name] = $triggers
                }
            }
        }
    }
    
    return $triggerMap
}

# Default triggers for mother-brain (if not in metadata)
function Get-MotherBrainTriggers {
    return @(
        "create project",
        "start project",
        "build project",
        "new project",
        "make project",
        "create app",
        "build app",
        "new app",
        "make app",
        "I want to create",
        "I want to build",
        "I want to make"
    )
}

# Calculate confidence score
function Get-ConfidenceScore {
    param(
        [string]$NormalizedInput,
        [string[]]$Triggers
    )
    
    $maxScore = 0.0
    
    foreach ($trigger in $Triggers) {
        $normalizedTrigger = Normalize-Input $trigger
        
        # Exact phrase match
        if ($NormalizedInput -like "*$normalizedTrigger*") {
            $maxScore = [Math]::Max($maxScore, 1.0)
            continue
        }
        
        # Keyword combination match
        $keywords = $normalizedTrigger -split '\s+'
        $matchCount = ($keywords | Where-Object { $NormalizedInput -like "*$_*" }).Count
        
        if ($matchCount -eq $keywords.Count) {
            $maxScore = [Math]::Max($maxScore, 0.85)
        }
        elseif ($matchCount -ge 1) {
            $score = 0.50 + (0.20 * $matchCount / $keywords.Count)
            $maxScore = [Math]::Max($maxScore, $score)
        }
    }
    
    return $maxScore
}

# False positive filters
function Test-FalsePositive {
    param([string]$NormalizedInput)
    
    # Question indicators
    $questionWords = @("what", "how", "why", "when", "where", "who", "which")
    foreach ($word in $questionWords) {
        if ($NormalizedInput -match "\b$word\b") {
            return $true
        }
    }
    
    # Past tense indicators (already done)
    if ($NormalizedInput -match "\b(created|built|made|started)\b") {
        return $true
    }
    
    # Generic greetings
    if ($NormalizedInput -match "^\s*(hi|hello|hey|thanks|thank you)\s*$") {
        return $true
    }
    
    return $false
}

# Main detection logic
function Detect-SkillIntent {
    param([string]$UserMessage)
    
    $normalized = Normalize-Input $UserMessage
    
    # Check for false positives
    if (Test-FalsePositive $normalized) {
        Write-Host "No auto-trigger: Message appears to be a question or greeting" -ForegroundColor Yellow
        return $null
    }
    
    # Get all skill triggers
    $triggerMap = Get-SkillTriggers
    
    # Add default mother-brain triggers
    if (-not $triggerMap.ContainsKey("mother-brain")) {
        $triggerMap["mother-brain"] = Get-MotherBrainTriggers
    }
    
    # Calculate confidence for each skill
    $results = @()
    foreach ($skillName in $triggerMap.Keys) {
        $score = Get-ConfidenceScore $normalized $triggerMap[$skillName]
        
        if ($score -ge $ConfidenceThreshold) {
            $results += @{
                Skill = $skillName
                Confidence = $score
            }
        }
    }
    
    # Return highest confidence match
    if ($results.Count -gt 0) {
        $topMatch = $results | Sort-Object -Property Confidence -Descending | Select-Object -First 1
        return $topMatch
    }
    
    return $null
}

# Execute detection
$result = Detect-SkillIntent $UserMessage

if ($null -ne $result) {
    Write-Host "`n✓ Intent detected: $($result.Skill) (confidence: $([Math]::Round($result.Confidence * 100))%)" -ForegroundColor Green
    
    # Special handling for mother-brain
    if ($result.Skill -eq "mother-brain") {
        Write-Host @"

    ___________________
   /                   \
  /  ╔═══════════════╗  \
 |   ║  M O T H E R  ║   |
 |   ║   B R A I N   ║   |
  \  ╚═══════════════╝  /
   \___________________/
       ||         ||
      //\\       //\\
     //  \\     //  \\
    //====\\   //====\\
   
   👽 Vision-Driven Development 👽

"@ -ForegroundColor Cyan
    }
    
    Write-Host "Triggering skill: /skill $($result.Skill)`n" -ForegroundColor Magenta
}
else {
    Write-Host "No skill intent detected. Proceeding with normal conversation." -ForegroundColor Gray
}
