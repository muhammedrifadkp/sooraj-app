"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var fi_1 = require("react-icons/fi");
var react_router_dom_1 = require("react-router-dom");
var config_1 = require("../config");
var SafeDisplay_1 = require("./SafeDisplay");
var CourseCard = function (_a) {
    var course = _a.course;
    var navigate = (0, react_router_dom_1.useNavigate)();
    // Safely access instructor information
    var getInstructorInfo = function () {
        if (typeof course.instructor === 'object' && course.instructor !== null) {
            return course.instructor.name || 'Unknown Instructor';
        }
        return typeof course.instructor === 'string' ? course.instructor : 'Unknown Instructor';
    };
    // Ensure instructor is never rendered directly
    var safeInstructor = getInstructorInfo();
    return (<framer_motion_1.motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Course Thumbnail */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
                {course.thumbnail ? (<img src={"".concat(config_1.API_URL, "/courses/").concat(course._id, "/thumbnail")} alt={course.title} className="w-full h-full object-cover object-center" onError={function (e) {
                console.error('Error loading thumbnail:', e);
                e.currentTarget.src = "".concat(config_1.API_URL, "/uploads/thumbnails/default.jpg");
            }}/>) : (<div className="w-full h-full flex items-center justify-center">
                        <fi_1.FiBook className="text-white text-6xl"/>
                    </div>)}
            </div>

            {/* Course Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    <SafeDisplay_1.default value={course.title} defaultValue="Untitled Course"/>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                    <SafeDisplay_1.default value={course.description} defaultValue="No description available"/>
                </p>

                {/* Course Stats */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                        <fi_1.FiClock className="mr-1"/>
                        <span><SafeDisplay_1.default value={course.duration} defaultValue="N/A"/></span>
                    </div>
                </div>
                
                {/* Instructor */}
                <div className="flex items-center text-gray-600 mb-3">
                    <fi_1.FiUser className="mr-1"/>
                    <span>Instructor: <SafeDisplay_1.default value={safeInstructor} defaultValue="Unknown"/></span>
                </div>

                {/* Rating and Action */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <fi_1.FiStar className="text-yellow-400 mr-1"/>
                        <span className="text-gray-700 font-semibold">
                            <SafeDisplay_1.default value={course.rating ? course.rating.toFixed(1) : 'New'} defaultValue="New"/>
                        </span>
                    </div>
                    <button onClick={function () { return navigate("/courses/".concat(course._id)); }} className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200">
                        View Details
                        <fi_1.FiArrowRight className="ml-1"/>
                    </button>
                </div>
            </div>
        </framer_motion_1.motion.div>);
};
exports.default = CourseCard;
