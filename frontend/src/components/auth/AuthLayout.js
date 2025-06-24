"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AuthLayout_module_css_1 = require("./AuthLayout.module.css");
var fa_1 = require("react-icons/fa");
var AuthLayout = function (_a) {
    var children = _a.children, title = _a.title, subtitle = _a.subtitle;
    return (<div className={AuthLayout_module_css_1.default.authContainer}>
      <div className={AuthLayout_module_css_1.default.leftPanel}>
        <div className={AuthLayout_module_css_1.default.decorationCircle + ' ' + AuthLayout_module_css_1.default.circle1}></div>
        <div className={AuthLayout_module_css_1.default.decorationCircle + ' ' + AuthLayout_module_css_1.default.circle2}></div>

        <div className={AuthLayout_module_css_1.default.leftPanelContent}>
          <h1 className={AuthLayout_module_css_1.default.welcomeTitle}>Welcome to LMS</h1>
          <p className={AuthLayout_module_css_1.default.welcomeSubtitle}>
            A comprehensive Learning Management System designed to enhance your educational experience.
          </p>

          <div className={AuthLayout_module_css_1.default.featuresList}>
            <div className={AuthLayout_module_css_1.default.featureItem}>
              <div className={AuthLayout_module_css_1.default.featureIcon}>
                <fa_1.FaGraduationCap />
              </div>
              <div className={AuthLayout_module_css_1.default.featureText}>
                Access to comprehensive courses and learning materials
              </div>
            </div>

            <div className={AuthLayout_module_css_1.default.featureItem}>
              <div className={AuthLayout_module_css_1.default.featureIcon}>
                <fa_1.FaVideo />
              </div>
              <div className={AuthLayout_module_css_1.default.featureText}>
                Participate in interactive live classes and webinars
              </div>
            </div>

            <div className={AuthLayout_module_css_1.default.featureItem}>
              <div className={AuthLayout_module_css_1.default.featureIcon}>
                <fa_1.FaBook />
              </div>
              <div className={AuthLayout_module_css_1.default.featureText}>
                Complete assignments and track your progress
              </div>
            </div>

            <div className={AuthLayout_module_css_1.default.featureItem}>
              <div className={AuthLayout_module_css_1.default.featureIcon}>
                <fa_1.FaCertificate />
              </div>
              <div className={AuthLayout_module_css_1.default.featureText}>
                Earn certificates upon course completion
              </div>
            </div>

            <div className={AuthLayout_module_css_1.default.featureItem}>
              <div className={AuthLayout_module_css_1.default.featureIcon}>
                <fa_1.FaChartLine />
              </div>
              <div className={AuthLayout_module_css_1.default.featureText}>
                Monitor your performance with detailed analytics
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={AuthLayout_module_css_1.default.rightPanel}>
        <div className={AuthLayout_module_css_1.default.formContainer}>
          <div className={AuthLayout_module_css_1.default.formHeader}>
            <h2 className={AuthLayout_module_css_1.default.formTitle}>{title}</h2>
            <p className={AuthLayout_module_css_1.default.formSubtitle}>{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>);
};
exports.default = AuthLayout;
