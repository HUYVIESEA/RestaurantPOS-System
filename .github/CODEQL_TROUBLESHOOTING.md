# CodeQL Troubleshooting Guide

## Common Issues and Solutions

### 1. Analyze-Kotlin Job Failing

#### Symptoms
- ❌ Android build fails
- ❌ Gradle errors
- ❌ CodeQL cannot find source files

#### Solutions

**Option A: Use Autobuild (Recommended)**
```yaml
- name: Autobuild
  uses: github/codeql-action/autobuild@v3
```

**Option B: Manual Build with Error Handling**
```yaml
- name: Build Android
  run: |
    cd RestaurantPOS.Android
    chmod +x gradlew
    ./gradlew assembleDebug --stacktrace
  continue-on-error: false  # Let it fail to see errors
```

**Option C: Disable Kotlin Analysis Temporarily**
Comment out the entire `analyze-kotlin` job in `codeql-analysis.yml`

---

### 2. Build Errors

#### Missing local.properties
```yaml
- name: Create local.properties
  run: |
    echo "sdk.dir=$ANDROID_HOME" > local.properties
  working-directory: ./RestaurantPOS.Android
```

#### Gradle Permission Denied
```yaml
- name: Grant execute permission
  run: chmod +x gradlew
  working-directory: ./RestaurantPOS.Android
```

#### Missing Android SDK
```yaml
- name: Setup Android SDK
  uses: android-actions/setup-android@v3
```

---

### 3. CodeQL Errors

#### Query Suite Not Found
```yaml
# ❌ BAD
queries: security-extended

# ✅ GOOD
queries: security-and-quality
```

#### Missing Category
```yaml
- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
  with:
    category: "/language:java"  # Required for multiple languages
```

#### Config File Not Found
```yaml
# Make sure file exists at:
# .github/codeql/codeql-config.yml

# Or remove config-file if not needed:
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: java
    queries: security-and-quality
    # config-file: ./.github/codeql/codeql-config.yml  # REMOVE THIS LINE
```

---

### 4. Performance Issues

#### Slow Gradle Build

**Use caching:**
```yaml
- name: Cache Gradle packages
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*') }}
```

**Enable Gradle daemon:**
```yaml
- name: Setup Gradle
  run: |
    mkdir -p ~/.gradle
    echo "org.gradle.daemon=true" >> ~/.gradle/gradle.properties
    echo "org.gradle.parallel=true" >> ~/.gradle/gradle.properties
```

---

### 5. Alternative: Disable Kotlin Analysis

If Kotlin analysis continues to fail, you can disable it:

**Edit `.github/workflows/codeql-analysis.yml`:**

```yaml
# Comment out or delete this entire job
# analyze-kotlin:
#   name: Analyze Kotlin Code
#   ...
```

**Why you might want to do this:**
- Android app is not mission-critical
- Backend and Frontend are more important
- Can enable later when Android is more stable

---

### 6. Test Locally

**Using act (GitHub Actions locally):**

```bash
# Install act
choco install act-cli  # Windows

# Run CodeQL workflow
act push -W .github/workflows/codeql-analysis.yml
```

---

### 7. Simplified Kotlin Analysis

Minimal working version:

```yaml
analyze-kotlin:
  name: Analyze Kotlin Code
  runs-on: ubuntu-latest
  permissions:
    actions: read
    contents: read
    security-events: write
    
  steps:
  - uses: actions/checkout@v4
  
  - uses: actions/setup-java@v4
    with:
      java-version: '17'
      distribution: 'temurin'
      
  - uses: android-actions/setup-android@v3
  
  - name: Initialize CodeQL
    uses: github/codeql-action/init@v3
    with:
      languages: java
      
  - name: Autobuild
    uses: github/codeql-action/autobuild@v3
    continue-on-error: true
    
  - name: Perform Analysis
    uses: github/codeql-action/analyze@v3
    with:
      category: "/language:java"
```

---

### 8. Debug Mode

Enable debug logging:

```yaml
- name: Build with Debug
  run: |
    cd RestaurantPOS.Android
    ./gradlew assembleDebug --info --stacktrace
  env:
    TERM: dumb
```

---

### 9. Check Workflow Logs

1. Go to **Actions** tab
2. Click on failed workflow run
3. Click on "analyze-kotlin" job
4. Expand failed step
5. Look for specific error message

Common errors:
- `ANDROID_HOME not set` → Add Setup Android SDK
- `Permission denied` → Add chmod +x gradlew
- `Build failed` → Check Gradle configuration
- `No code found` → Check paths in config

---

### 10. Quick Fixes

**If job times out:**
```yaml
jobs:
  analyze-kotlin:
    timeout-minutes: 30  # Default is 360
```

**If language detection fails:**
```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: java
    setup-python-dependencies: false
```

**If analysis finds no results:**
Check that source files are in the right location:
```yaml
paths:
  - 'RestaurantPOS.Android/app/src/main/**/*.kt'
  - 'RestaurantPOS.Android/app/src/main/**/*.java'
```

---

## Contact

If none of these solutions work:
1. Share the full error log
2. Specify which step is failing
3. Check GitHub Actions status page
4. Consider filing an issue on codeql-action repo

---

## Updated Workflow Status

Current configuration uses:
- ✅ Autobuild (automatic detection)
- ✅ Android SDK setup
- ✅ Gradle caching
- ✅ Proper permissions
- ✅ Error handling with fail-fast: false

This should resolve most common issues!
