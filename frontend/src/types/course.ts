export interface Course {
    _id: string;
    title: string;
    description: string;
    department: string;
    instructor: string | InstructorType;
    duration: string;
    thumbnail?: string;
    youtubeLink?: string;
    modules: Module[];
    materials: Material[];
    createdAt: string;
    updatedAt: string;
    rating?: number;
    enrolledCount?: number;
}

export interface InstructorType {
    _id: string;
    name: string;
    email: string;
}

export interface Module {
    _id: string;
    title: string;
    description: string;
    content: string;
    type: string;
}

export interface Material {
    _id: string;
    title: string;
    description: string;
    fileUrl: string;
    type: string;
}