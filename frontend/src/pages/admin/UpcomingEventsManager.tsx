import React from 'react';
import UpcomingAssignmentsManager from '../../components/Admin/UpcomingAssignments/UpcomingAssignmentsManager';
import UpcomingLiveClassesManager from '../../components/Admin/UpcomingLiveClasses/UpcomingLiveClassesManager';

const UpcomingEventsManager: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Upcoming Events</h1>
      <p className="text-gray-600 mb-8">
        Manage upcoming assignments and live classes for students. Create, edit, or delete events as needed.
      </p>
      
      <UpcomingAssignmentsManager />
      <UpcomingLiveClassesManager />
    </div>
  );
};

export default UpcomingEventsManager;
