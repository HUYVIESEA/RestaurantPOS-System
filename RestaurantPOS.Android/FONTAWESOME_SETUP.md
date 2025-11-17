# Font Awesome Setup Guide

## What I've Added

I've successfully added Font Awesome support to your Android project using the Iconify library. Here's what was configured:

### 1. Dependencies Added

**In `gradle/libs.versions.toml`:**
- Added Font Awesome version: `fontawesome = "5.15.4"`
- Added library: `fontawesome = { group = "com.joanzapata.iconify", name = "android-iconify-fontawesome", version.ref = "fontawesome" }`

**In `app/build.gradle.kts`:**
- Added dependency: `implementation(libs.fontawesome)`

### 2. Initialization in MainActivity

The Font Awesome module is now initialized in your `MainActivity.onCreate()` method:

```java
// Initialize Font Awesome
Iconify.with(new FontAwesomeModule());
```

### 3. Example Usage Added

I've added an example Font Awesome heart icon in `activity_main.xml` to demonstrate usage:

```xml
<com.joanzapata.iconify.widget.IconTextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="{fa-heart}"
    android:textSize="48sp"
    android:textColor="#FF0000"
    ... />
```

## How to Use Font Awesome Icons

### In XML Layouts

Use `IconTextView` for displaying Font Awesome icons:

```xml
<com.joanzapata.iconify.widget.IconTextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="{fa-star}"
    android:textSize="32sp"
    android:textColor="#FFD700" />
```

### In Java Code

You can also set icons programmatically:

```java
import com.joanzapata.iconify.widget.IconTextView;

IconTextView iconView = findViewById(R.id.myIcon);
iconView.setText("{fa-user}");
```

### Using Icons with Regular TextViews

You can use icons inline with regular text:

```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Welcome {fa-smile-o}" />
```

Then in your Activity, wrap the text with Iconify:

```java
TextView textView = findViewById(R.id.myTextView);
textView.setText(Iconify.compute(this, "Welcome {fa-smile-o}"));
```

### Using Icons in Buttons

```xml
<com.joanzapata.iconify.widget.IconButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="{fa-download} Download" />
```

## Popular Font Awesome Icon Names

Here are some commonly used icons for a Restaurant POS system:

- `{fa-cutlery}` - Restaurant/dining
- `{fa-shopping-cart}` - Shopping cart
- `{fa-coffee}` - Coffee/beverages
- `{fa-credit-card}` - Payment
- `{fa-user}` - User/customer
- `{fa-users}` - Multiple users/staff
- `{fa-clock-o}` - Time
- `{fa-calendar}` - Calendar/reservations
- `{fa-list}` - Menu/list
- `{fa-plus}` - Add item
- `{fa-minus}` - Remove item
- `{fa-trash}` - Delete
- `{fa-edit}` - Edit
- `{fa-check}` - Confirm
- `{fa-times}` - Cancel/close
- `{fa-print}` - Print receipt
- `{fa-search}` - Search

## Next Steps

1. **Sync Gradle**: In Android Studio, click "Sync Now" in the notification bar or go to File → Sync Project with Gradle Files
2. **Build the project**: Make sure the Font Awesome dependency is downloaded
3. **Run the app**: You should see a red heart icon below the "Hello World!" text

## Troubleshooting

If icons don't appear:
1. Make sure you've initialized Iconify in your Application or Activity's `onCreate()` method
2. Verify the Gradle sync was successful
3. Clean and rebuild the project (Build → Clean Project, then Build → Rebuild Project)

## Alternative: Using Material Icons

If you prefer Material Design icons instead, Google's Material Icons are built into the Material Design library which is already included in your project. Let me know if you'd like to use those instead!

## Documentation

For more Font Awesome icons and advanced usage, visit:
- [Iconify Library on GitHub](https://github.com/JoanZapata/android-iconify)
- [Font Awesome Icon List](https://fontawesome.com/v5/search?m=free&s=solid)

