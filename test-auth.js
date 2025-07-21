// Authentication Test Script for Browser
// Run this in browser console to test authentication

const BASE_URL = 'https://pionner-server-prod-v0-1.onrender.com/api/v1';

class AuthTester {
    constructor() {
        this.testResults = [];
        this.accessToken = null;
        this.refreshToken = null;
        this.userEmail = null;
    }

    log(message, type = 'info') {
        const colors = {
            success: 'color: green; font-weight: bold;',
            error: 'color: red; font-weight: bold;',
            info: 'color: blue; font-weight: bold;',
            warning: 'color: orange; font-weight: bold;'
        };
        console.log(`%c${message}`, colors[type]);
    }

    async testEndpoint(name, method, endpoint, data = null, headers = {}) {
        try {
            const config = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://pionner-v-1.onrender.com',
                    ...headers
                }
            };

            if (data) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            const result = await response.json();

            // Check for tokens in headers
            const accessToken = response.headers.get('x-access-token');
            const refreshToken = response.headers.get('x-refresh-token');

            if (accessToken) {
                this.accessToken = accessToken;
                this.log(`✅ Access token received`, 'success');
            }
            if (refreshToken) {
                this.refreshToken = refreshToken;
                this.log(`✅ Refresh token received`, 'success');
            }

            if (result.success) {
                this.log(`✅ ${name}: Success`, 'success');
                this.testResults.push({ name, status: 'success', data: result });
                return result;
            } else {
                this.log(`❌ ${name}: Failed - ${result.message}`, 'error');
                this.testResults.push({ name, status: 'error', data: result });
                return null;
            }
        } catch (error) {
            this.log(`❌ ${name}: Error - ${error.message}`, 'error');
            this.testResults.push({ name, status: 'error', error: error.message });
            return null;
        }
    }

    async runTests() {
        this.log('🔐 Starting Authentication Tests...', 'info');
        console.log('==========================================');

        // Test 1: Health Check
        await this.testEndpoint('Health Check', 'GET', '/health');

        // Test 2: Signup
        const timestamp = Date.now();
        const signupData = {
            name: 'Test User',
            email: `testuser${timestamp}@example.com`,
            phone: '+1234567890',
            password: 'TestPass123!',
            confirmPassword: 'TestPass123!'
        };
        
        const signupResult = await this.testEndpoint('Signup', 'POST', '/auth/signup', signupData);
        if (signupResult) {
            this.userEmail = signupResult.data.user.email;
        }

        // Test 3: Login
        if (this.userEmail) {
            const loginData = {
                email: this.userEmail,
                password: 'TestPass123!'
            };
            await this.testEndpoint('Login', 'POST', '/auth/login', loginData);
        }

        // Test 4: Protected Route (Profile)
        if (this.accessToken) {
            await this.testEndpoint('Protected Route (Profile)', 'GET', '/auth/profile', null, {
                'Authorization': `Bearer ${this.accessToken}`
            });
        }

        // Test 5: Token Refresh
        if (this.refreshToken) {
            await this.testEndpoint('Token Refresh', 'POST', '/auth/refresh-token', null, {
                'Authorization': `Bearer ${this.refreshToken}`
            });
        }

        // Test 6: Products API (for wishlist)
        await this.testEndpoint('Products API', 'GET', '/products/getFeaturedProducts');

        // Test 7: Logout
        if (this.accessToken) {
            await this.testEndpoint('Logout', 'POST', '/auth/logout', null, {
                'Authorization': `Bearer ${this.accessToken}`
            });
        }

        this.printResults();
    }

    printResults() {
        console.log('==========================================');
        this.log('🎉 Test Results Summary:', 'info');
        console.log('==========================================');

        const successCount = this.testResults.filter(r => r.status === 'success').length;
        const totalCount = this.testResults.length;

        this.testResults.forEach(result => {
            const status = result.status === 'success' ? '✅' : '❌';
            this.log(`${status} ${result.name}`, result.status);
        });

        console.log('==========================================');
        this.log(`📊 Results: ${successCount}/${totalCount} tests passed`, successCount === totalCount ? 'success' : 'warning');
        
        if (successCount === totalCount) {
            this.log('🚀 All tests passed! Your authentication system is working perfectly!', 'success');
            this.log('💡 You can now use wishlist and all other features!', 'success');
        } else {
            this.log('⚠️ Some tests failed. Check the errors above.', 'warning');
        }

        // Show token info if available
        if (this.accessToken || this.refreshToken) {
            console.log('==========================================');
            this.log('🔑 Token Information:', 'info');
            if (this.accessToken) {
                console.log('Access Token:', this.accessToken);
                console.log('Access Token (decoded):', this.decodeToken(this.accessToken));
            }
            if (this.refreshToken) {
                console.log('Refresh Token:', this.refreshToken);
                console.log('Refresh Token (decoded):', this.decodeToken(this.refreshToken));
            }
        }
    }

    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return 'Invalid token';
        }
    }

    // Test wishlist functionality
    async testWishlist() {
        this.log('🛍️ Testing Wishlist Functionality...', 'info');
        
        if (!this.accessToken) {
            this.log('❌ No access token available for wishlist test', 'error');
            return;
        }

        // Get products first
        const productsResponse = await fetch(`${BASE_URL}/products/getProducts?limit=1`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Origin': 'https://pionner-v-1.onrender.com'
            }
        });

        const productsData = await productsResponse.json();
        
        if (productsData.success && productsData.data.length > 0) {
            const productId = productsData.data[0]._id;
            
            // Test adding to wishlist
            const addToWishlistResponse = await fetch(`${BASE_URL}/wishlist/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Origin': 'https://pionner-v-1.onrender.com'
                },
                body: JSON.stringify({ productId })
            });

            const addResult = await addToWishlistResponse.json();
            
            if (addResult.success) {
                this.log('✅ Add to wishlist successful', 'success');
                
                // Test getting wishlist
                const getWishlistResponse = await fetch(`${BASE_URL}/wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Origin': 'https://pionner-v-1.onrender.com'
                    }
                });

                const getResult = await getWishlistResponse.json();
                
                if (getResult.success) {
                    this.log('✅ Get wishlist successful', 'success');
                    this.log(`📦 Wishlist contains ${getResult.data.length} items`, 'info');
                } else {
                    this.log('❌ Get wishlist failed', 'error');
                }
            } else {
                this.log('❌ Add to wishlist failed', 'error');
            }
        } else {
            this.log('❌ No products available for wishlist test', 'error');
        }
    }
}

// Create and run the tester
const tester = new AuthTester();

// Run basic tests
tester.runTests().then(() => {
    // After basic tests, test wishlist
    setTimeout(() => {
        tester.testWishlist();
    }, 1000);
});

// Export for manual testing
window.authTester = tester; 