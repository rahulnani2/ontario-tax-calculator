# 1. Always branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/scenario-comparison

# 2. Make your changes, commit as you go
git add .
git commit -m "feat: add ScenarioComparison component"

# 3. Push and open PR
git push -u origin feature/scenario-comparison
# GitHub → Open Pull Request → base: develop

# 4. Merge PR into develop
# 5. When develop is stable → PR from develop into main

# Tag Release on main
git checkout main
git tag -a v1.0.0 -m "Initial release — 3-tier Azure deployment"
git push origin v1.0.0