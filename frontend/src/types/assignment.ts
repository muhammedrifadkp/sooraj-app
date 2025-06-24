import { Course } from './course';

export interface Assignment {
    _id: string;
    title: string;
    description: string;
    department: 'CSE' | 'EEE' | 'MECH';
    dueDate: string;
    totalMarks: number;
    instructions: string;
    course: string | Course;
    attachments: {
        name: string;
        url: string;
        type: string;
    }[];
    questions: {
        text: string;
        type: 'multiple-choice' | 'short-answer' | 'essay' | 'long-answer';
        options?: string[];
        correctAnswer?: string;
        marks?: number;
    }[];
    submissions?: {
        student: string;
        answers: {
            questionId: number;
            answer: string;
            isCorrect?: boolean;
            marks?: number;
            feedback?: string;
        }[];
        submittedAt: string;
        evaluation?: {
            totalMarks: number;
            earnedMarks: number;
            percentage: number;
            scaledScore: number;
            status: 'pending' | 'evaluated' | 'graded';
            evaluatedBy?: string;
            evaluatedAt?: string;
            feedback?: string;
            comments?: string;
        };
    }[];
    createdAt: string;
    updatedAt: string;
}