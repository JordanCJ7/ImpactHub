# Contributing to ImpactHub

## Academic Project Notice

This repository is part of **SLIIT (Sri Lanka Institute of Information Technology) academic coursework**. Contributions are restricted to authorized project group members only.

## Contributor Eligibility

**⚠️ IMPORTANT:** Only members of the assigned project group are permitted to contribute to this repository. External contributions will not be accepted as this is academic coursework with specific evaluation criteria.

## Branch Protection Rules

All team members **MUST** follow the established branch protection rules:

### Branching Strategy

1. **Main Branch (`main`)**: Protected production branch
2. **Development Branch (`dev`)**: Primary development branch
3. **Feature Branches**: All new work must be done in feature branches

### Branch Creation Rules

- ✅ **DO**: Create all sub-branches from the `dev` branch
- ❌ **DON'T**: Create branches directly from `main`
- ❌ **DON'T**: Push directly to `main` or `dev` branches

### Branch Naming Convention

Use descriptive branch names following this pattern:
```
feature/brief-description
bugfix/brief-description
hotfix/brief-description
```

Examples:
- `feature/user-authentication`
- `bugfix/donation-validation`
- `hotfix/security-patch`

## Pull Request Process

### Code Review Requirements

**🔒 MANDATORY:** All pull requests require successful code reviews from **at least one** of the following authorized reviewers:

- **Janitha Gamage (PM)**
- **Dewmini Navodya (Scrum Master)**
- **GitHub Copilot** (AI-assisted reviews)

### Pull Request Guidelines

1. **Create Feature Branch**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "descriptive commit message"
   git push origin feature/your-feature-name
   ```

3. **Open Pull Request**
   - Target: `dev` branch
   - Provide clear description of changes
   - Reference any related issues
   - Wait for required code review approval

4. **Code Review Process**
   - Address all review comments
   - Make necessary changes
   - Re-request review if needed
   - **DO NOT MERGE** without successful review approval

### Merge Requirements

- ✅ Successful code review from authorized reviewer
- ✅ All CI/CD checks passing
- ✅ No merge conflicts
- ✅ Updated documentation (if applicable)

## Development Workflow

1. **Always start from `dev`**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create your feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Develop and test your changes**
   - Write clean, documented code
   - Add appropriate tests
   - Follow project coding standards

4. **Submit pull request**
   - Target `dev` branch
   - Wait for code review
   - Address feedback promptly

## Code Standards

### General Guidelines

- Write clear, readable code
- Include appropriate comments
- Follow existing code style
- Write unit tests for new features
- Update documentation as needed

### Commit Message Format

Use clear, descriptive commit messages:
```
type: brief description

Detailed explanation if needed
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Academic Integrity

This project is subject to SLIIT's academic integrity policies. All contributors must:

- Submit original work
- Properly attribute any external resources
- Follow university guidelines for group projects
- Maintain confidentiality of assessment materials

## Contact

For questions about contributing guidelines or access permissions, contact the project group members through official SLIIT channels.

---

**Remember: This is academic coursework. Unauthorized contributions may violate academic integrity policies.**
