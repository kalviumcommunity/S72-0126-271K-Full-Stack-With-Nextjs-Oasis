## 🧩 Code Quality & Developer Experience

This project uses Strict TypeScript, ESLint + Prettier, and Git pre-commit hooks (Husky + lint-staged) to maintain high code quality, reduce bugs, and ensure team-wide consistency.

## ✅ Why Strict TypeScript Mode Reduces Runtime Bugs

Strict TypeScript mode enforces stronger type safety at compile time. By enabling strict checks (such as strictNullChecks, noImplicitAny, and strictFunctionTypes), many common runtime errors are caught before the code runs.

## Key benefits:

- Prevents accessing undefined or null values unintentionally

- Forces explicit typing, reducing assumptions in logic

- Catches incorrect function arguments and return types early

- Makes refactoring safer and more predictable

- By shifting error detection from runtime to development time, strict TypeScript significantly reduces bugs that would otherwise appear in production.

## 🧹 What ESLint + Prettier Enforce

This project combines ESLint for code correctness and Prettier for consistent formatting.

## ESLint enforces:

- Detection of unused variables and imports

- Prevention of common JavaScript and TypeScript logic errors

- Best practices for React and Next.js

- Consistent use of modern JavaScript/TypeScript syntax

## Prettier enforces:

- Consistent indentation, spacing, and line breaks

- Uniform formatting across all files

- Elimination of style-related debates in code reviews

- Using eslint-config-prettier ensures there are no conflicts between linting rules and formatting rules.

## 🔒 How Pre-Commit Hooks Improve Team Consistency

Pre-commit hooks run automatically before every Git commit to ensure code quality standards are met.

## With Husky + lint-staged, the project:

- Runs ESLint and Prettier only on staged files

- Prevents committing code with linting or formatting errors

- Ensures all contributors follow the same rules automatically

- Reduces code review time by catching issues early

- This creates a shared baseline of quality, making collaboration smoother and preventing inconsistent or broken code from entering the repository.

## 📌 Summary

- Strict TypeScript catches bugs early

- ESLint + Prettier enforce correctness and consistency

- Pre-commit hooks automate quality checks for every contributor

- Together, these tools create a reliable, scalable, and team-friendly development workflow.