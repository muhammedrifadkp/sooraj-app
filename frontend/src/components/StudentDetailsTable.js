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
var framer_motion_1 = require("framer-motion");
var fi_1 = require("react-icons/fi");
var AuthContext_1 = require("../context/AuthContext");
var axios_1 = require("axios");
var StudentDetailsTable = function () {
    var _a = (0, react_1.useState)([]), students = _a[0], setStudents = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(''), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = (0, react_1.useState)('all'), selectedDepartment = _e[0], setSelectedDepartment = _e[1];
    var user = (0, AuthContext_1.useAuth)().user;
    var _f = (0, react_1.useState)(''), updating = _f[0], setUpdating = _f[1]; // studentId being updated
    // Helper to check if current user is admin
    var isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    (0, react_1.useEffect)(function () {
        loadStudents();
    }, []);
    var loadStudents = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, studentData, err_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    console.log('Fetching students from API...');
                    return [4 /*yield*/, axios_1.default.get("".concat(import.meta.env.VITE_API_URL, "/admin/students"), {
                            headers: {
                                Authorization: "Bearer ".concat(localStorage.getItem('token'))
                            }
                        })];
                case 1:
                    response = _d.sent();
                    console.log('API Response:', response.data);
                    studentData = Array.isArray(response.data) ? response.data : [];
                    console.log('Processed student data:', studentData);
                    setStudents(studentData);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _d.sent();
                    console.error('Error loading students:', err_1);
                    if (axios_1.default.isAxiosError(err_1)) {
                        console.error('API Error:', (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data);
                        setError(((_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to load student data');
                    }
                    else {
                        setError('Failed to load student data');
                    }
                    setStudents([]); // Set empty array on error
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleAttendanceUpdate = function (studentId, action) { return __awaiter(void 0, void 0, void 0, function () {
        var student, liveClassId, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setUpdating(studentId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    student = students.find(function (s) { return s._id === studentId; });
                    if (!student || !((_a = student.attendance.liveClassIds) === null || _a === void 0 ? void 0 : _a.length)) {
                        alert('No live class found for this student');
                        setUpdating('');
                        return [2 /*return*/];
                    }
                    liveClassId = student.attendance.liveClassIds[0];
                    return [4 /*yield*/, axios_1.default.post("".concat(import.meta.env.VITE_API_URL, "/attendance/admin/update-present"), {
                            userId: studentId,
                            liveClassId: liveClassId,
                            action: action
                        }, {
                            headers: {
                                Authorization: "Bearer ".concat(localStorage.getItem('token'))
                            }
                        })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, loadStudents()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _b.sent();
                    alert('Failed to update attendance');
                    return [3 /*break*/, 6];
                case 5:
                    setUpdating('');
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var filteredStudents = students.filter(function (student) {
        var matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });
    var getDepartmentColor = function (department) {
        switch (department) {
            case 'CSE':
                return 'bg-blue-100 text-blue-800';
            case 'EEE':
                return 'bg-purple-100 text-purple-800';
            case 'MECH':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (loading) {
        return (<div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>);
    }
    if (error) {
        return (<div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-gray-500">{error}</p>
        <button onClick={loadStudents} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
          Retry
        </button>
      </div>);
    }
    return (<div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg mr-3">
              <fi_1.FiUsers className="text-indigo-500"/>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Student Details</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <fi_1.FiSearch className="h-5 w-5 text-gray-400"/>
              </div>
              <input type="text" placeholder="Search students..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            </div>
            <select value={selectedDepartment} onChange={function (e) { return setSelectedDepartment(e.target.value); }} className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg">
              <option value="all">All Departments</option>
              <option value="CSE">Computer Science Engineering (CSE)</option>
              <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
              <option value="MECH">Mechanical Engineering (MECH)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignments
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courses
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map(function (student) { return (<framer_motion_1.motion.tr key={student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                        <fi_1.FiUser className="text-indigo-500"/>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={"px-2.5 py-1 text-xs font-medium rounded-full ".concat(getDepartmentColor(student.department))}>
                    {student.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.assignments.total > 0 ? (<>
                      <div className="text-sm text-gray-900">
                        {student.assignments.submitted}/{student.assignments.total} submitted
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg. Score: {student.assignments.averageScore}%
                      </div>
                    </>) : (<div className="flex items-center text-amber-600">
                      <fi_1.FiAlertCircle className="mr-1.5"/>
                      <span className="text-sm">No assignments available</span>
                    </div>)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.attendance.total > 0 ? (<>
                      <div className="text-sm text-gray-900">
                        {student.attendance.present}/{student.attendance.total} classes
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.attendance.percentage}% attendance
                      </div>
                      {isAdmin && student.attendance.liveClassIds && student.attendance.liveClassIds.length > 0 && (<div className="flex space-x-2 mt-2">
                          <button className="inline-flex items-center px-2 py-1 border border-green-500 text-green-700 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50" title="Increase Present" onClick={function () { return handleAttendanceUpdate(student._id, 'increase'); }} disabled={updating === student._id}>
                            <fi_1.FiPlus />
                          </button>
                          <button className="inline-flex items-center px-2 py-1 border border-red-500 text-red-700 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50" title="Decrease Present" onClick={function () { return handleAttendanceUpdate(student._id, 'decrease'); }} disabled={updating === student._id}>
                            <fi_1.FiMinus />
                          </button>
                        </div>)}
                    </>) : (<div className="flex items-center text-amber-600">
                      <fi_1.FiAlertCircle className="mr-1.5"/>
                      <span className="text-sm">No classes available</span>
                    </div>)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.courses.enrolled > 0 ? (<>
                      <div className="text-sm text-gray-900">
                        {student.courses.enrolled} enrolled
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.courses.completed} completed
                      </div>
                    </>) : (<div className="flex items-center text-amber-600">
                      <fi_1.FiAlertCircle className="mr-1.5"/>
                      <span className="text-sm">No courses available</span>
                    </div>)}
                </td>
              </framer_motion_1.motion.tr>); })}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (<div className="text-center py-12">
          <fi_1.FiUsers className="mx-auto h-12 w-12 text-gray-400"/>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>)}
    </div>);
};
exports.default = StudentDetailsTable;
