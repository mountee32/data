const auth = require('./auth');
const assert = require('assert').strict;

// Mock Express request/response/next
const mockReq = (headers = {}) => ({
    headers
});

const mockRes = () => {
    const res = {
        status: function(code) {
            res.statusCode = code;
            return res;
        },
        json: function(data) {
            res.body = data;
            return res;
        }
    };
    return res;
};

const mockNext = () => jest.fn();

async function testAuthenticationService() {
    console.log('Testing Authentication Service...\n');

    try {
        // Test 1: Login with valid credentials
        console.log('Test 1: Valid login');
        const validLogin = await auth.login('1234567890', '123456');
        assert(validLogin.success, 'Login should succeed');
        assert(validLogin.token, 'Should return a session token');
        assert(validLogin.customer.accountNumber === '1234567890', 'Should return customer info');
        console.log('✓ Valid login successful');
        
        // Store token for later tests
        const validToken = validLogin.token;

        // Test 2: Login with invalid credentials
        console.log('\nTest 2: Invalid login');
        const invalidLogin = await auth.login('wrong', 'wrong');
        assert(!invalidLogin.success, 'Login should fail');
        assert(invalidLogin.error === 'Invalid credentials', 'Should return error message');
        console.log('✓ Invalid login rejected');

        // Test 3: Token validation
        console.log('\nTest 3: Token validation');
        const validValidation = await auth.validateToken(validToken);
        assert(validValidation.valid, 'Valid token should be accepted');
        assert(validValidation.customerId === '1234567890', 'Should return customer ID');
        console.log('✓ Valid token accepted');

        const invalidValidation = await auth.validateToken('invalid_token');
        assert(!invalidValidation.valid, 'Invalid token should be rejected');
        console.log('✓ Invalid token rejected');

        // Test 4: Authentication middleware
        console.log('\nTest 4: Authentication middleware');
        const middleware = auth.middleware();

        // Test valid token
        const validReq = mockReq({
            authorization: `Bearer ${validToken}`
        });
        const validRes = mockRes();
        let nextCalled = false;
        await middleware(validReq, validRes, () => nextCalled = true);
        
        assert(nextCalled, 'Next should be called for valid token');
        assert(validReq.customer.id === '1234567890', 'Customer ID should be added to request');
        console.log('✓ Middleware passes valid token');

        // Test invalid token
        const invalidReq = mockReq({
            authorization: 'Bearer invalid_token'
        });
        const invalidRes = mockRes();
        await middleware(invalidReq, invalidRes, () => {});
        
        assert(invalidRes.statusCode === 401, 'Should return 401 for invalid token');
        assert(invalidRes.body.error, 'Should return error message');
        console.log('✓ Middleware rejects invalid token');

        // Test missing authorization header
        const noAuthReq = mockReq({});
        const noAuthRes = mockRes();
        await middleware(noAuthReq, noAuthRes, () => {});
        
        assert(noAuthRes.statusCode === 401, 'Should return 401 for missing auth');
        assert(noAuthRes.body.error === 'No authorization header', 'Should return error message');
        console.log('✓ Middleware rejects missing authorization');

        console.log('\n✓ All authentication tests passed!');
    } catch (error) {
        console.error('\n✗ Test failed:', error);
        throw error;
    }
}

// Run tests
testAuthenticationService().catch(console.error);