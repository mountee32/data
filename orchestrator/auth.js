const db = require('./db');

class AuthenticationService {
    // Generate a session token
    generateToken() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    // Validate credentials and create session
    async login(accountNumber, code) {
        try {
            // Validate credentials against database
            const customer = await db.validateCredentials(accountNumber, code);
            if (!customer) {
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }

            // Generate and store session token
            const token = this.generateToken();
            await db.createSession(token, customer.account_number);

            return {
                success: true,
                token,
                customer: {
                    accountNumber: customer.account_number
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Authentication failed'
            };
        }
    }

    // Validate session token
    async validateToken(token) {
        try {
            if (!token) {
                return {
                    valid: false,
                    error: 'No token provided'
                };
            }

            const session = await db.validateSession(token);
            if (!session) {
                return {
                    valid: false,
                    error: 'Invalid session'
                };
            }

            return {
                valid: true,
                customerId: session.customer_id
            };
        } catch (error) {
            console.error('Token validation error:', error);
            return {
                valid: false,
                error: 'Session validation failed'
            };
        }
    }

    // Authentication middleware
    middleware() {
        return async (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: 'No authorization header' });
            }

            const token = authHeader.split(' ')[1];
            const validation = await this.validateToken(token);

            if (!validation.valid) {
                return res.status(401).json({ error: validation.error });
            }

            // Add customer info to request
            req.customer = {
                id: validation.customerId
            };

            next();
        };
    }
}

module.exports = new AuthenticationService();