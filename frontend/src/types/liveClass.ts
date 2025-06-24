export interface LiveClass {
    _id: string;
    title: string;
    description: string;
    course: string | {
        _id: string;
        title: string;
    };
    department: 'CSE' | 'EEE' | 'MECH';
    startTime: string;
    endTime: string;
    duration: number;
    maxParticipants: number;
    meetingLink: string;
    instructor: string | {
        _id: string;
        name: string;
        email: string;
    };
    materials: {
        name: string;
        url: string;
        type: string;
    }[];
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    participants?: string[];
    recordingUrl?: string;
    createdAt: string;
    updatedAt: string;
}