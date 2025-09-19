#!/bin/bash

echo "=== CSS DEBUGGING SCRIPT ==="
echo "Checking Tailwind CSS setup..."
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ Node modules installed"
else
    echo "✗ Node modules missing - run 'npm install'"
    exit 1
fi

# Check if Tailwind is installed
if [ -f "node_modules/.bin/tailwindcss" ]; then
    echo "✓ Tailwind CSS installed"
else
    echo "✗ Tailwind CSS not found"
    exit 1
fi

# Check configuration files
echo ""
echo "Configuration files:"
[ -f "tailwind.config.js" ] && echo "✓ tailwind.config.js" || echo "✗ tailwind.config.js missing"
[ -f "postcss.config.js" ] && echo "✓ postcss.config.js" || echo "✗ postcss.config.js missing"
[ -f "src/index.css" ] && echo "✓ src/index.css" || echo "✗ src/index.css missing"

# Test Tailwind compilation
echo ""
echo "Testing Tailwind compilation..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Build successful"
    # Check if CSS file was generated
    if find dist -name "*.css" -type f | grep -q .; then
        echo "✓ CSS files generated"
        css_file=$(find dist -name "*.css" -type f | head -1)
        css_size=$(wc -c < "$css_file" | tr -d ' ')
        echo "  CSS file size: ${css_size} bytes"
    else
        echo "✗ No CSS files generated"
    fi
else
    echo "✗ Build failed"
fi

# Check if specific Tailwind classes exist in built CSS
echo ""
echo "Checking for LoginPage classes in built CSS..."
css_file=$(find dist -name "*.css" -type f | head -1)
if [ -f "$css_file" ]; then
    echo "Checking built CSS for key classes:"
    grep -q "bg-gradient-to-br" "$css_file" && echo "✓ bg-gradient-to-br" || echo "✗ bg-gradient-to-br"
    grep -q "backdrop-blur-sm" "$css_file" && echo "✓ backdrop-blur-sm" || echo "✗ backdrop-blur-sm"
    grep -q "bg-grid-pattern" "$css_file" && echo "✓ bg-grid-pattern (custom)" || echo "✗ bg-grid-pattern"
    grep -q "shadow-2xl" "$css_file" && echo "✓ shadow-2xl" || echo "✗ shadow-2xl"
fi

echo ""
echo "=== RECOMMENDATIONS ==="
echo "1. Clear browser cache completely (Cmd+Shift+R on Mac)"
echo "2. Start fresh dev server: npm run dev"
echo "3. Navigate to http://localhost:3001/login"
echo "4. Open browser dev tools and check:"
echo "   - Network tab: verify CSS files are loading"
echo "   - Console tab: check for JavaScript errors"
echo "   - Elements tab: inspect if Tailwind classes are applied"
echo ""
echo "If issues persist, the problem is likely browser cache or"
echo "you're looking at the wrong URL/port."