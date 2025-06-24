"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var OtpVerification_1 = require("./OtpVerification");
var api_1 = require("../../services/api");
var RegisterForm = function () {
    var _a = (0, react_1.useState)({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: 'CSE',
    }), formData = _a[0], setFormData = _a[1];
    var _b = (0, react_1.useState)(false), showPassword = _b[0], setShowPassword = _b[1];
    var _c = (0, react_1.useState)(false), showConfirmPassword = _c[0], setShowConfirmPassword = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        general: '',
    }), errors = _e[0], setErrors = _e[1];
    var _f = (0, react_1.useState)(false), showOtpVerification = _f[0], setShowOtpVerification = _f[1];
    var register = (0, AuthContext_1.useAuth)().register;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
        // Clear error for this field
        if (errors[name]) {
            setErrors(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[name] = '', _a)));
            });
        }
    };
    var validateForm = function () {
        var newErrors = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            general: '',
        };
        var isValid = true;
        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        }
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }
        else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }
        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    // Send OTP to user's email
    var sendOtp = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1, errorMessage_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { general: '' })); });
                    return [4 /*yield*/, api_1.otpAPI.sendRegistrationOTP(formData.email)];
                case 1:
                    response = _a.sent();
                    // Show OTP verification screen
                    setShowOtpVerification(true);
                    // If we're in development mode and the OTP is returned, show it for easier testing
                    if (response.devMode && response.otp) {
                        react_hot_toast_1.toast.success("OTP sent to ".concat(formData.email, ". For testing, use: ").concat(response.otp));
                        console.log("OTP for testing: ".concat(response.otp));
                    }
                    else {
                        react_hot_toast_1.toast.success("OTP sent to ".concat(formData.email, ". Please check your inbox or server console."));
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    errorMessage_1 = err_1.message || 'Failed to send OTP. Please try again.';
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { general: errorMessage_1 })); });
                    react_hot_toast_1.toast.error(errorMessage_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Resend OTP
    var handleResendOtp = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api_1.otpAPI.sendRegistrationOTP(formData.email)];
                case 1:
                    response = _a.sent();
                    // If we're in development mode and the OTP is returned, show it for easier testing
                    if (response.devMode && response.otp) {
                        react_hot_toast_1.toast.success("OTP resent to ".concat(formData.email, ". For testing, use: ").concat(response.otp));
                        console.log("OTP for testing: ".concat(response.otp));
                    }
                    else {
                        react_hot_toast_1.toast.success("OTP resent to ".concat(formData.email, ". Please check your inbox or server console."));
                    }
                    return [2 /*return*/, Promise.resolve()];
                case 2:
                    err_2 = _a.sent();
                    react_hot_toast_1.toast.error('Failed to resend OTP. Please try again.');
                    return [2 /*return*/, Promise.reject(err_2)];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Complete registration after OTP verification
    var completeRegistration = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_3, errorMessage_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, register(formData.name, formData.email, formData.password, 'student', formData.department)];
                case 1:
                    _a.sent();
                    react_hot_toast_1.toast.success('Registration successful! Please log in.');
                    navigate('/login');
                    return [3 /*break*/, 4];
                case 2:
                    err_3 = _a.sent();
                    errorMessage_2 = err_3.message || 'Registration failed. Please try again.';
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { general: errorMessage_2 })); });
                    react_hot_toast_1.toast.error(errorMessage_2);
                    setShowOtpVerification(false); // Go back to registration form on error
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!validateForm()) {
                        return [2 /*return*/];
                    }
                    // Send OTP for verification
                    return [4 /*yield*/, sendOtp()];
                case 1:
                    // Send OTP for verification
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (<>
      {showOtpVerification ? (<OtpVerification_1.default email={formData.email} onVerificationSuccess={completeRegistration} onResendOtp={handleResendOtp} onCancel={function () { return setShowOtpVerification(false); }}/>) : (<form onSubmit={handleSubmit}>
          {errors.general && <div className={AuthLayout_module_css_1.default.errorText}>{errors.general}</div>}

          <div className={AuthLayout_module_css_1.default.formGroup}>
            <label htmlFor="name" className={AuthLayout_module_css_1.default.formLabel}>Full Name</label>
            <div className={AuthLayout_module_css_1.default.formInputWithIcon}>
              <fa_1.FaUserAlt className={AuthLayout_module_css_1.default.formInputIcon}/>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={AuthLayout_module_css_1.default.formInput} placeholder="Enter your full name"/>
            </div>
            {errors.name && <p className={AuthLayout_module_css_1.default.errorText}>{errors.name}</p>}
          </div>

          <div className={AuthLayout_module_css_1.default.formGroup}>
            <label htmlFor="email" className={AuthLayout_module_css_1.default.formLabel}>Email Address</label>
            <div className={AuthLayout_module_css_1.default.formInputWithIcon}>
              <fa_1.FaEnvelope className={AuthLayout_module_css_1.default.formInputIcon}/>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={AuthLayout_module_css_1.default.formInput} placeholder="Enter your email"/>
            </div>
            {errors.email && <p className={AuthLayout_module_css_1.default.errorText}>{errors.email}</p>}
          </div>

          <div className={AuthLayout_module_css_1.default.formGroup}>
            <label htmlFor="department" className={AuthLayout_module_css_1.default.formLabel}>Department</label>
            <div className={AuthLayout_module_css_1.default.formInputWithIcon}>
              <fa_1.FaGraduationCap className={AuthLayout_module_css_1.default.formInputIcon}/>
              <select id="department" name="department" value={formData.department} onChange={handleChange} className={AuthLayout_module_css_1.default.formInput}>
                <option value="CSE">Computer Science Engineering (CSE)</option>
                <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
              </select>
            </div>
          </div>

          <div className={AuthLayout_module_css_1.default.formGroup}>
            <label htmlFor="password" className={AuthLayout_module_css_1.default.formLabel}>Password</label>
            <div className={AuthLayout_module_css_1.default.formInputWithIcon}>
              <fa_1.FaLock className={AuthLayout_module_css_1.default.formInputIcon}/>
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} className={AuthLayout_module_css_1.default.formInput} placeholder="Create a password"/>
              <button type="button" className={AuthLayout_module_css_1.default.passwordToggle} onClick={function () { return setShowPassword(!showPassword); }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <fa_1.FaEyeSlash /> : <fa_1.FaEye />}
              </button>
            </div>
            {errors.password && <p className={AuthLayout_module_css_1.default.errorText}>{errors.password}</p>}
          </div>

          <div className={AuthLayout_module_css_1.default.formGroup}>
            <label htmlFor="confirmPassword" className={AuthLayout_module_css_1.default.formLabel}>Confirm Password</label>
            <div className={AuthLayout_module_css_1.default.formInputWithIcon}>
              <fa_1.FaLock className={AuthLayout_module_css_1.default.formInputIcon}/>
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={AuthLayout_module_css_1.default.formInput} placeholder="Confirm your password"/>
              <button type="button" className={AuthLayout_module_css_1.default.passwordToggle} onClick={function () { return setShowConfirmPassword(!showConfirmPassword); }} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? <fa_1.FaEyeSlash /> : <fa_1.FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className={AuthLayout_module_css_1.default.errorText}>{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className={AuthLayout_module_css_1.default.submitButton} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue to Verification'}
            {!loading && <fa_1.FaUserPlus />}
          </button>

          <div className={AuthLayout_module_css_1.default.formFooter}>
            <p>
              Already have an account?{' '}
              <react_router_dom_1.Link to="/login" className={AuthLayout_module_css_1.default.formFooterLink}>
                Sign in
              </react_router_dom_1.Link>
            </p>
          </div>
        </form>)}
    </>);
};
exports.default = RegisterForm;
