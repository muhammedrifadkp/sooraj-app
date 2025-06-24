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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var fa_1 = require("react-icons/fa");
var AuthLayout_module_css_1 = require("./AuthLayout.module.css");
var react_hot_toast_1 = require("react-hot-toast");
var api_1 = require("../../services/api");
var OtpVerification = function (_a) {
    var email = _a.email, onVerificationSuccess = _a.onVerificationSuccess, onResendOtp = _a.onResendOtp, onCancel = _a.onCancel;
    var _b = (0, react_1.useState)(Array(6).fill('')), otp = _b[0], setOtp = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(''), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(60), countdown = _e[0], setCountdown = _e[1];
    var _f = (0, react_1.useState)(false), canResend = _f[0], setCanResend = _f[1];
    var inputRefs = (0, react_1.useRef)([]);
    // Set up countdown timer
    (0, react_1.useEffect)(function () {
        if (countdown > 0 && !canResend) {
            var timer_1 = setTimeout(function () {
                setCountdown(countdown - 1);
            }, 1000);
            return function () { return clearTimeout(timer_1); };
        }
        else if (countdown === 0 && !canResend) {
            setCanResend(true);
        }
    }, [countdown, canResend]);
    // Handle OTP input change
    var handleOtpChange = function (index, value) {
        var _a, _b;
        // Only allow numbers
        if (value && !/^\d+$/.test(value))
            return;
        var newOtp = __spreadArray([], otp, true);
        // Handle paste event with multiple characters
        if (value.length > 1) {
            // If pasting, distribute the digits across the fields
            var digits = value.split('').slice(0, 6 - index);
            digits.forEach(function (digit, i) {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            // Focus on the next empty input or the last input
            var nextIndex = Math.min(index + digits.length, 5);
            (_a = inputRefs.current[nextIndex]) === null || _a === void 0 ? void 0 : _a.focus();
        }
        else {
            // Normal single digit input
            newOtp[index] = value;
            setOtp(newOtp);
            // Auto-focus next input if a digit was entered
            if (value && index < 5) {
                (_b = inputRefs.current[index + 1]) === null || _b === void 0 ? void 0 : _b.focus();
            }
        }
    };
    // Handle key down events for backspace and arrow navigation
    var handleKeyDown = function (index, e) {
        var _a, _b, _c;
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            // Move to previous input on backspace if current input is empty
            (_a = inputRefs.current[index - 1]) === null || _a === void 0 ? void 0 : _a.focus();
        }
        else if (e.key === 'ArrowLeft' && index > 0) {
            // Move to previous input on left arrow
            (_b = inputRefs.current[index - 1]) === null || _b === void 0 ? void 0 : _b.focus();
        }
        else if (e.key === 'ArrowRight' && index < 5) {
            // Move to next input on right arrow
            (_c = inputRefs.current[index + 1]) === null || _c === void 0 ? void 0 : _c.focus();
        }
    };
    // Handle OTP verification
    var handleVerify = function () { return __awaiter(void 0, void 0, void 0, function () {
        var otpValue, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    otpValue = otp.join('');
                    if (otpValue.length !== 6) {
                        setError('Please enter all 6 digits of the OTP');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    setError('');
                    return [4 /*yield*/, api_1.otpAPI.verifyOTP(email, otpValue)];
                case 2:
                    response = _a.sent();
                    if (response.success) {
                        onVerificationSuccess();
                        react_hot_toast_1.toast.success('Email verified successfully!');
                    }
                    else {
                        throw new Error(response.message || 'Invalid OTP');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || 'Failed to verify OTP. Please try again.');
                    react_hot_toast_1.toast.error('Failed to verify OTP');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle OTP resend
    var handleResendOtp = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError('');
                    return [4 /*yield*/, onResendOtp()];
                case 1:
                    _a.sent();
                    setCountdown(60);
                    setCanResend(false);
                    react_hot_toast_1.toast.success('OTP resent successfully!');
                    return [3 /*break*/, 4];
                case 2:
                    err_2 = _a.sent();
                    setError(err_2.message || 'Failed to resend OTP. Please try again.');
                    react_hot_toast_1.toast.error('Failed to resend OTP');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div>
      <div className={AuthLayout_module_css_1.default.formHeader} style={{ marginBottom: '1.5rem' }}>
        <h3 className={AuthLayout_module_css_1.default.formTitle}>Verify Your Email</h3>
        <p className={AuthLayout_module_css_1.default.formSubtitle}>
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>
      </div>

      {error && <div className={AuthLayout_module_css_1.default.errorText}>{error}</div>}

      <div className={AuthLayout_module_css_1.default.otpContainer}>
        {otp.map(function (digit, index) { return (<input key={index} type="text" maxLength={6} value={digit} onChange={function (e) { return handleOtpChange(index, e.target.value); }} onKeyDown={function (e) { return handleKeyDown(index, e); }} ref={function (ref) { return (inputRefs.current[index] = ref); }} className={AuthLayout_module_css_1.default.otpInput} autoFocus={index === 0}/>); })}
      </div>

      <div className={AuthLayout_module_css_1.default.formGroup} style={{ marginTop: '1.5rem' }}>
        <button type="button" className={AuthLayout_module_css_1.default.submitButton} onClick={handleVerify} disabled={loading || otp.join('').length !== 6}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </div>

      <div className={AuthLayout_module_css_1.default.otpActions}>
        <button type="button" className={AuthLayout_module_css_1.default.resendButton} onClick={handleResendOtp} disabled={!canResend || loading}>
          <fa_1.FaRedo className={AuthLayout_module_css_1.default.resendIcon}/>
          Resend OTP {!canResend && "(".concat(countdown, "s)")}
        </button>

        <button type="button" className={AuthLayout_module_css_1.default.changeEmailButton} onClick={onCancel}>
          Change Email
        </button>
      </div>
    </div>);
};
exports.default = OtpVerification;
