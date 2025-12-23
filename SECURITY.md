# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Free Parking Monitor seriously. If you discover a security vulnerability, please follow these steps:

### 1. DO NOT Create a Public Issue

Please **do not** create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send a detailed report to the repository maintainers via:
- GitHub Security Advisory (preferred)
- Direct message to maintainers

### 3. Include in Your Report

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30+ days

## Security Best Practices

### For Contributors

1. **Never commit secrets**
   - API keys
   - Passwords
   - Private tokens
   - Google Form entry IDs (use environment variables)

2. **Validate all inputs**
   - Sanitize user inputs
   - Validate data from external APIs
   - Check data types and ranges

3. **Use secure dependencies**
   - Keep dependencies up to date
   - Review dependency security advisories
   - Use `npm audit` regularly

4. **Follow secure coding practices**
   - Use HTTPS for all external requests
   - Implement proper error handling
   - Avoid exposing sensitive information in logs

### For Users

1. **Keep the application updated**
   - Pull latest changes regularly
   - Review release notes for security updates

2. **Review external API usage**
   - Understand what data is being fetched
   - Review CORS proxy usage
   - Monitor network requests

3. **Protect your data**
   - Clear cache periodically
   - Don't share localStorage data
   - Use HTTPS when deploying

## Known Security Considerations

### Current Implementation

1. **CORS Proxy**: The application uses a public CORS proxy (`corsproxy.io`) to access parking APIs
   - **Risk**: Third-party service could log requests
   - **Mitigation**: No sensitive data is sent through the proxy

2. **Google Forms Integration**: Form submission uses `no-cors` mode
   - **Risk**: Cannot validate submission success
   - **Mitigation**: Submissions are logged client-side

3. **Client-Side Storage**: Data cached in localStorage
   - **Risk**: Accessible via browser DevTools
   - **Mitigation**: No sensitive data is stored

4. **External APIs**: Fetches data from `zaparkuj.pl`
   - **Risk**: Dependent on external service availability
   - **Mitigation**: Error handling and fallback to cached data

### Planned Improvements

- [ ] Add Content Security Policy (CSP) headers
- [ ] Implement Subresource Integrity (SRI) for CDN resources
- [ ] Add rate limiting for API requests
- [ ] Implement proper environment variable management
- [ ] Add security headers for deployment

## Security Checklist

Before deploying:

- [ ] All dependencies are up to date
- [ ] No secrets in code or configuration
- [ ] HTTPS is enforced
- [ ] Error messages don't expose sensitive info
- [ ] Input validation is in place
- [ ] CORS is properly configured
- [ ] Security headers are set

## Disclosure Policy

When a security vulnerability is fixed:

1. A security advisory will be published
2. Release notes will include security fixes
3. Credit will be given to reporter (if desired)
4. Details will be disclosed after fix is widely deployed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)
- [npm Security Best Practices](https://docs.npmjs.com/security)

## Contact

For security concerns, contact the repository maintainers through:
- GitHub Security Advisory (preferred)
- GitHub Issues (for non-sensitive security discussions)

Thank you for helping keep Free Parking Monitor secure! 🔒
