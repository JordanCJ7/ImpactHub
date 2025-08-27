# Security Policy

## Academic Project Security Notice

This security policy applies to the **ImpactHub** project, which is part of SLIIT (Sri Lanka Institute of Information Technology) academic coursework. While this is an educational project, we maintain security best practices as part of our learning objectives.

## Supported Versions

As an academic project, we focus on the latest development version:

| Version | Supported          |
| ------- | ------------------ |
| Dev     | :white_check_mark: |
| Main    | :white_check_mark: |

## Reporting a Vulnerability

### For Academic Project Team Members

If you discover a security vulnerability in this academic project:

1. **DO NOT** create a public issue
2. Report immediately to project group members:
   - **Janitha Gamage** (Project Lead)
   - **Dewmini Navodya** (Scrum Master)
   - Contact through official SLIIT channels

### Reporting Process

1. **Initial Report**
   - Email project team members
   - Include a detailed description of the vulnerability
   - Provide steps to reproduce (if applicable)
   - Mention potential impact

2. **Response Timeline**
   - Initial acknowledgment: Within 48 hours
   - Assessment completion: Within 1 week
   - Fix implementation: Within 2 weeks (depending on complexity)

## Security Guidelines for Development

### Code Security Best Practices

#### Backend Security (Node.js/Express)

1. **Authentication & Authorization**
   ```javascript
   // Use proper authentication middleware
   const jwt = require('jsonwebtoken');
   const bcrypt = require('bcrypt');
   
   // Hash passwords before storing
   const saltRounds = 12;
   const hashedPassword = await bcrypt.hash(password, saltRounds);
   ```

2. **Input Validation & Sanitization**
   ```javascript
   // Validate and sanitize all inputs
   const { body, validationResult } = require('express-validator');
   
   // Example validation
   body('email').isEmail().normalizeEmail(),
   body('amount').isNumeric().isFloat({ min: 0.01 })
   ```

3. **SQL Injection Prevention**
   ```javascript
   // Use parameterized queries
   const query = 'SELECT * FROM users WHERE email = ?';
   db.query(query, [email], callback);
   ```

4. **Rate Limiting**
   ```javascript
   // Implement rate limiting
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

#### Frontend Security (React)

1. **XSS Prevention**
   ```jsx
   // React automatically escapes JSX
   // Avoid dangerouslySetInnerHTML unless necessary
   <div>{userInput}</div> // Safe
   ```

2. **Secure API Calls**
   ```javascript
   // Use HTTPS in production
   // Implement proper error handling
   const apiCall = async (endpoint, data) => {
     try {
       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify(data)
       });
       return response.json();
     } catch (error) {
       // Handle errors securely
       console.error('API call failed:', error);
       throw new Error('Request failed');
     }
   };
   ```

### Environment Security

1. **Environment Variables**
   ```bash
   # .env file (never commit to repository)
   DB_CONNECTION_STRING=mongodb://localhost:27017/impactHub
   JWT_SECRET=your-super-secret-jwt-key-here
   API_KEY=your-api-key-here
   NODE_ENV=development
   ```

2. **Dependencies Security**
   ```bash
   # Regularly audit dependencies
   npm audit
   npm audit fix
   
   # Keep dependencies updated
   npm update
   ```

## Security Checklist for Pull Requests

Before submitting a pull request, ensure:

- [ ] No sensitive data (passwords, API keys, secrets) in code
- [ ] All user inputs are validated and sanitized
- [ ] Authentication is properly implemented
- [ ] Authorization checks are in place
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date and secure
- [ ] HTTPS is used for all external API calls
- [ ] Proper session management is implemented

## Common Security Vulnerabilities to Avoid

### 1. Authentication Issues
- ❌ Storing passwords in plain text
- ❌ Weak password requirements
- ❌ Missing authentication on protected routes
- ❌ Improper session management

### 2. Input Validation
- ❌ SQL injection vulnerabilities
- ❌ Cross-site scripting (XSS)
- ❌ Command injection
- ❌ Path traversal attacks

### 3. Data Exposure
- ❌ Sensitive data in logs
- ❌ Detailed error messages in production
- ❌ Unencrypted sensitive data storage
- ❌ Missing access controls

### 4. Configuration Issues
- ❌ Default credentials
- ❌ Unnecessary services enabled
- ❌ Missing security headers
- ❌ Improper CORS configuration

## Security Tools and Resources

### Recommended Security Tools

1. **Static Analysis**
   ```bash
   # ESLint security plugin
   npm install --save-dev eslint-plugin-security
   
   # Dependency vulnerability scanner
   npm audit
   ```

2. **Runtime Security**
   ```bash
   # Helmet.js for security headers
   npm install helmet
   
   # Express rate limiting
   npm install express-rate-limit
   ```

### Educational Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Guidelines](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Academic Learning Objectives

This security policy serves the following academic learning objectives:

1. **Understanding Security Fundamentals**
   - Learn common web application vulnerabilities
   - Understand secure coding practices
   - Implement proper authentication and authorization

2. **Industry Best Practices**
   - Follow security guidelines used in professional development
   - Learn to use security tools and scanners
   - Understand the importance of security in software development

3. **Responsible Disclosure**
   - Learn how to report security issues appropriately
   - Understand the impact of security vulnerabilities
   - Practice ethical security research

## Compliance and Academic Integrity

- All security practices must comply with SLIIT academic policies
- Security testing should only be performed on this academic project
- Do not attempt to test security on external systems
- Report any security concerns through proper academic channels

## Contact for Security Issues

For security-related questions or concerns:

- **Project Team**: Contact through SLIIT official channels
- **Academic Supervisor**: Through university email system
- **Emergency**: Follow SLIIT incident reporting procedures

---

**Note**: This security policy is part of academic coursework and serves educational purposes. Real-world security implementations may require additional considerations and professional security audits.
