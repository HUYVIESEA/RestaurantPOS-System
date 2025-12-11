/**
 * NAVBAR DEBUG SCRIPT
 * Run this in browser console to diagnose issues
 */

console.log('🔍 NAVBAR DEBUG STARTED 🔍');
console.log('================================');

// 1. Check if navbar element exists
const navbar = document.querySelector('.modern-navbar');
console.log('1. Navbar element found:', !!navbar);

if (!navbar) {
  console.error('❌ NAVBAR NOT FOUND! Check if component is rendered.');
} else {
  // 2. Check current theme
  const htmlTheme = document.documentElement.getAttribute('data-theme');
  const bodyTheme = document.body.getAttribute('data-theme');
  console.log('2. Theme on <html>:', htmlTheme || 'not set');
  console.log('   Theme on <body>:', bodyTheme || 'not set');
  
  // 3. Check computed styles
  const styles = window.getComputedStyle(navbar);
  console.log('3. Computed background:', styles.background.substring(0, 100));
  console.log('   Background color:', styles.backgroundColor);
  console.log('   Background image:', styles.backgroundImage.substring(0, 100));
  
  // 4. Check all classes
  console.log('4. Navbar classes:', navbar.className);
  
  // 5. Check CSS rules that apply
  const sheets = Array.from(document.styleSheets);
  let navbarRules = [];
  
  sheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      rules.forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes('modern-navbar')) {
          navbarRules.push({
            selector: rule.selectorText,
            background: rule.style.background || rule.style.backgroundColor,
            file: sheet.href ? sheet.href.split('/').pop() : 'inline'
          });
        }
      });
    } catch (e) {
      // CORS might block some stylesheets
    }
  });
  
  console.log('5. CSS Rules for navbar:', navbarRules);
  
  // 6. Check if dark mode rule exists
  const darkModeRule = navbarRules.find(r => r.selector.includes('data-theme'));
  console.log('6. Dark mode rule found:', !!darkModeRule);
  if (darkModeRule) {
    console.log('   Dark mode selector:', darkModeRule.selector);
    console.log('   Dark mode background:', darkModeRule.background);
  }
  
  // 7. Check navbar container
  const container = navbar.querySelector('.navbar-container');
  console.log('7. Navbar container found:', !!container);
  
  // 8. Check actions
  const actions = navbar.querySelector('.navbar-actions');
  console.log('8. Navbar actions found:', !!actions);
  if (actions) {
    const bell = actions.querySelector('.bell-button');
    const toggle = actions.querySelector('.theme-toggle');
    const user = actions.querySelector('.navbar-user');
    console.log('   - Notification bell:', !!bell);
    console.log('   - Theme toggle:', !!toggle);
    console.log('   - User menu:', !!user);
  }
  
  // 9. Check mobile menu
  const mobileMenu = navbar.querySelector('.navbar-menu');
  console.log('9. Mobile menu found:', !!mobileMenu);
  if (mobileMenu) {
    const isOpen = mobileMenu.classList.contains('mobile-open');
    console.log('   Mobile menu open:', isOpen);
  }
  
  // 10. Check viewport width
  const width = window.innerWidth;
  console.log('10. Viewport width:', width);
  console.log('    Should show hamburger:', width < 768);
  console.log('    Should hide labels:', width < 1024);
  
  // 11. Test theme toggle
  console.log('11. Testing theme toggle...');
  const currentTheme = htmlTheme || 'light';
  console.log('    Current theme:', currentTheme);
  console.log('    Try toggling theme and run this script again');
}

console.log('================================');
console.log('🏁 DEBUG COMPLETE 🏁');
console.log('\n📋 ACTIONS TO TRY:');
console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
console.log('2. Hard refresh (Ctrl+Shift+R)');
console.log('3. Check DevTools > Network > Navbar.css');
console.log('4. Toggle dark mode and check again');
console.log('5. Inspect element and check "Computed" styles');
