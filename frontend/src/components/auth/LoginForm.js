"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var fa_1 = require("react-icons/fa");
var AuthLayout_module_css_1 = require("./AuthLayout.module.css");
var AuthContext_1 = require("../../context/AuthContext");
var react_hot_toast_1 = require("react-hot-toast");
var LoginForm = function (_a) {
    var _b = _a.isAdmin, isAdmin = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)(''), email = _c[0], setEmail = _c[1];
    var _d = (0, react_1.useState)(''), password = _d[0], setPassword = _d[1];
    var _e = (0, react_1.useState)(false), showPassword = _e[0], setShowPassword = _e[1];
    var _f = (0, react_1.useState)(false), rememberMe = _f[0], setRememberMe = _f[1];
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(''), error = _h[0], setError = _h[1];
    var login = (0, AuthContext_1.useAuth)().login;
    var navigate = (0, react_router_dom_1.useNavigate)();
    // Test credentials data
    var testCredentials = [
        {
            type: 'Admin',
            icon: <fa_1.FaUserShield />,
            accounts: [
                { name: 'Main Admin', email: 'admin@lms.com', password: 'Admin@123', department: 'Administration' },
                { name: 'CS Admin', email: 'csadmin@lms.com', password: 'CSAdmin@123', department: 'CSE' },
                { name: 'EEE Admin', email: 'eeeadmin@lms.com', password: 'EEEAdmin@123', department: 'EEE' },
                { name: 'MECH Admin', email: 'mechadmin@lms.com', password: 'MECHAdmin@123', department: 'MECH' },
                { name: 'Super Admin', email: 'superadmin@lms.com', password: 'Super@123', department: 'All' }
            ]
        },
        {
            type: 'Student',
            icon: <fa_1.FaUser />,
            accounts: [
                { name: 'CS Student', email: 'student@lms.com', password: 'Student@123', department: 'CSE' },
                { name: 'EEE Student', email: 'eee.student@lms.com', password: 'Student@123', department: 'EEE' },
                { name: 'MECH Student', email: 'mech.student@lms.com', password: 'Student@123', department: 'MECH' }
            ]
        },
        {
            type: 'Instructor',
            icon: <fa_1.FaChalkboardTeacher />,
            accounts: [
                { name: 'CS Instructor', email: 'instructor@lms.com', password: 'Instructor@123', department: 'CSE' },
                { name: 'EEE Instructor', email: 'eee.instructor@lms.com', password: 'Instructor@123', department: 'EEE' },
                { name: 'MECH Instructor', email: 'mech.instructor@lms.com', password: 'Instructor@123', department: 'MECH' }
            ]
        }
    ];
    // Function to fill credentials
    var fillCredentials = function (email, password) {
        setEmail(email);
        setPassword(password);
        react_hot_toast_1.toast.success('Credentials filled! Click Login to continue.');
    };
    // Function to copy credentials to clipboard
    var copyCredentials = function (email, password) {
        var text = "Email: ".concat(email, "\nPassword: ").concat(password);
        navigator.clipboard.writeText(text).then(function () {
            react_hot_toast_1.toast.success('Credentials copied to clipboard!');
        }).catch(function () {
            react_hot_toast_1.toast.error('Failed to copy credentials');
        });
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!email || !password) {
                        setError('Please enter both email and password');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setError('');
                    setLoading(true);
                    return [4 /*yield*/, login(email, password)];
                case 2:
                    _a.sent();
                    // Redirect based on role
                    if (isAdmin) {
                        navigate('/admin/dashboard');
                    }
                    else {
                        navigate('/dashboard');
                    }
                    react_hot_toast_1.toast.success('Login successful!');
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || 'Failed to login. Please check your credentials.');
                    react_hot_toast_1.toast.error('Login failed. Please check your credentials.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<form onSubmit={handleSubmit}>
      {error && <div className={AuthLayout_module_css_1.default.errorText}>{error}</div>}

      <div className={AuthLayout_module_css_1.default.formGroup}>
        <label htmlFor="email" className={AuthLayout_module_css_1.default.formLabel}>Email Address</label>
        <div className={AuthLayout_module_css_1.default.formInputWithIcon}>
          <fa_1.FaEnvelope className={AuthLayout_module_css_1.default.formInputIcon}/>
          <input type="email" id="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} className={AuthLayout_module_css_1.default.formInput} placeholder="Enter your email" required/>
        </div>
      </div>

      <div className={AuthLayout_module_css_1.default.formGroup}>
        <label htmlFor="password" className={AuthLayout_module_css_1.default.formLabel}>Password</label>
        <div className={AuthLayout_module_css_1.default.formInputWithIcon}>
          <fa_1.FaLock className={AuthLayout_module_css_1.default.formInputIcon}/>
          <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={function (e) { return setPassword(e.target.value); }} className={AuthLayout_module_css_1.default.formInput} placeholder="Enter your password" required/>
          <button type="button" className={AuthLayout_module_css_1.default.passwordToggle} onClick={function () { return setShowPassword(!showPassword); }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <fa_1.FaEyeSlash /> : <fa_1.FaEye />}
          </button>
        </div>
      </div>

      <div className={AuthLayout_module_css_1.default.rememberForgot}>
        <label className={AuthLayout_module_css_1.default.rememberMe}>
          <input type="checkbox" checked={rememberMe} onChange={function (e) { return setRememberMe(e.target.checked); }} className={AuthLayout_module_css_1.default.rememberMeCheckbox}/>
          Remember me
        </label>

        <react_router_dom_1.Link to="/forgot-password" className={AuthLayout_module_css_1.default.forgotPassword}>
          Forgot Password?
        </react_router_dom_1.Link>
      </div>

      <button type="submit" className={AuthLayout_module_css_1.default.submitButton} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
        {!loading && <fa_1.FaSignInAlt />}
      </button>

      <div className={AuthLayout_module_css_1.default.formDivider}>Or continue with</div>

      <div className={AuthLayout_module_css_1.default.socialLogin}>
        <button type="button" className={AuthLayout_module_css_1.default.socialButton} onClick={function () { return react_hot_toast_1.toast.error('Google login not implemented yet'); }}>
          <fa_1.FaGoogle className={AuthLayout_module_css_1.default.googleIcon}/>
          Google
        </button>

        <button type="button" className={AuthLayout_module_css_1.default.socialButton} onClick={function () { return react_hot_toast_1.toast.error('Microsoft login not implemented yet'); }}>
          <fa_1.FaMicrosoft className={AuthLayout_module_css_1.default.microsoftIcon}/>
          Microsoft
        </button>
      </div>

      {/* Test Credentials Section */}
      <div className={AuthLayout_module_css_1.default.testCredentials}>
        <div className={AuthLayout_module_css_1.default.testCredentialsHeader}>
          <h4 className={AuthLayout_module_css_1.default.testCredentialsTitle}>Test Accounts</h4>
          <p className={AuthLayout_module_css_1.default.testCredentialsSubtitle}>Click to auto-fill credentials</p>
        </div>

        {testCredentials.map(function (category) { return (<div key={category.type} className={AuthLayout_module_css_1.default.credentialCategory}>
            <div className={AuthLayout_module_css_1.default.categoryHeader}>
              {category.icon}
              <span className={AuthLayout_module_css_1.default.categoryTitle}>{category.type} Accounts</span>
            </div>

            <div className={AuthLayout_module_css_1.default.accountsList}>
              {category.accounts.map(function (account, index) { return (<div key={index} className={AuthLayout_module_css_1.default.accountItem}>
                  <div className={AuthLayout_module_css_1.default.accountInfo}>
                    <div className={AuthLayout_module_css_1.default.accountName}>{account.name}</div>
                    <div className={AuthLayout_module_css_1.default.accountEmail}>{account.email}</div>
                    <div className={AuthLayout_module_css_1.default.accountDepartment}>{account.department}</div>
                  </div>

                  <div className={AuthLayout_module_css_1.default.accountActions}>
                    <button type="button" className={AuthLayout_module_css_1.default.fillButton} onClick={function () { return fillCredentials(account.email, account.password); }} title="Fill credentials">
                      Fill
                    </button>
                    <button type="button" className={AuthLayout_module_css_1.default.copyButton} onClick={function () { return copyCredentials(account.email, account.password); }} title="Copy credentials">
                      <fa_1.FaCopy />
                    </button>
                  </div>
                </div>); })}
            </div>
          </div>); })}
      </div>

      <div className={AuthLayout_module_css_1.default.formFooter}>
        {isAdmin ? (<p>
            Not an administrator?{' '}
            <react_router_dom_1.Link to="/login" className={AuthLayout_module_css_1.default.formFooterLink}>
              Login as Student
            </react_router_dom_1.Link>
          </p>) : (<p>
            Don't have an account?{' '}
            <react_router_dom_1.Link to="/signup" className={AuthLayout_module_css_1.default.formFooterLink}>
              Sign up
            </react_router_dom_1.Link>
          </p>)}
      </div>
    </form>);
};
exports.default = LoginForm;
