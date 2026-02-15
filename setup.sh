#!/bin/bash

# Quest API Discovery Challenge Setup
# Activity 11: Build a gamified API exploration experience

echo "🎯 Setting up Quest API Discovery Challenge..."
echo ""

if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the activity-11-quest-api directory"
    exit 1
fi

echo "📚 Discovery Challenge Overview:"
echo "   🎯 Create a gamified API learning experience"
echo "   🎮 Focus: Gamification, progressive disclosure, engagement"
echo "   🔬 Method: Game design and API integration"
echo ""

echo "🎓 DISCOVERY LEARNING OBJECTIVES:"
echo "   1. Research gamification patterns in web applications"
echo "   2. Explore progressive API complexity introduction"
echo "   3. Investigate achievement and progress systems"
echo "   4. Master engaging user experience design"
echo "   5. Build educational game mechanics"
echo ""

if command -v python3 &> /dev/null; then
    echo "🚀 Starting server at: http://localhost:8000"
    python3 -m http.server 8000
else
    echo "❌ Python not found. Use VS Code Live Server or similar."
fi

echo "✨ Gamify the learning experience! 🎯"