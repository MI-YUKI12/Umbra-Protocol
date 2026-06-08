# Umbra Protocol - Development & Contribution Guidelines

## Code Style

### Python
- Follow PEP 8 style guide
- Use 4 spaces for indentation
- Maximum line length: 100 characters
- Use meaningful variable names

### JavaScript
- Use camelCase for variable names
- Use const/let instead of var
- Add comments for complex logic
- Use arrow functions when appropriate

### HTML/CSS
- Use semantic HTML5 elements
- Follow BEM naming convention for CSS classes
- Use lowercase for HTML
- Indent with 4 spaces

## Commit Messages

Use clear, descriptive commit messages:

```
[TYPE] Brief description

Detailed explanation if needed.

Fixes #issue_number
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit your changes
7. Push to your fork
8. Create a Pull Request with a clear description

## Testing

Before submitting:

```bash
# Run backend tests
cd backend
python -m pytest

# Check code style
flake8 .
```

## Documentation

Update relevant documentation for:
- New features
- API changes
- Database schema changes
- Configuration options

## Performance

- Optimize database queries
- Use pagination for large datasets
- Cache when appropriate
- Monitor API response times

## Security

- Never hardcode secrets
- Validate all inputs
- Use parameterized queries
- Keep dependencies updated
- Review security best practices

## Reporting Issues

Include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots/logs if applicable

---

Thank you for contributing! 🙏
