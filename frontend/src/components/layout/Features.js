"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Features = Features;
var framer_motion_1 = require("framer-motion");
var outline_1 = require("@heroicons/react/24/outline");
var features = [
    {
        name: 'Expert Instructors',
        description: 'Learn from industry professionals with years of experience in their fields.',
        icon: outline_1.AcademicCapIcon,
    },
    {
        name: 'Interactive Learning',
        description: 'Engage with other learners and instructors through our interactive platform.',
        icon: outline_1.UserGroupIcon,
    },
    {
        name: 'Flexible Schedule',
        description: 'Learn at your own pace with 24/7 access to course materials.',
        icon: outline_1.ClockIcon,
    },
    {
        name: 'Mobile Learning',
        description: 'Access your courses on any device, anywhere in the world.',
        icon: outline_1.DevicePhoneMobileIcon,
    },
];
var container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};
var item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};
function Features() {
    return (<div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <framer_motion_1.motion.h2 className="text-base font-semibold leading-7 text-primary" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            Learn faster
          </framer_motion_1.motion.h2>
          <framer_motion_1.motion.p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            Everything you need to succeed
          </framer_motion_1.motion.p>
          <framer_motion_1.motion.p className="mt-6 text-lg leading-8 text-gray-600" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            Our platform provides all the tools and resources you need to achieve your learning goals.
            Start your journey today.
          </framer_motion_1.motion.p>
        </div>
        <framer_motion_1.motion.div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map(function (feature) { return (<framer_motion_1.motion.div key={feature.name} variants={item}>
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true"/>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </framer_motion_1.motion.div>); })}
          </dl>
        </framer_motion_1.motion.div>
      </div>
    </div>);
}
