export function normalizeAnswer(answer: string): string {
    // Remove all whitespace
    let normalized = answer.replace(/\s+/g, '');
    
    // Convert to lowercase
    normalized = normalized.toLowerCase();
    
    // Remove any special characters that might cause issues
    normalized = normalized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Remove common punctuation
    normalized = normalized.replace(/[.,!?;:]/g, '');
    
    return normalized;
}

export function validateAnswer(studentAnswer: string, correctAnswer: string, answerType: string = 'short'): boolean {
    // Normalize both answers
    const normalizedStudent = normalizeAnswer(studentAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    // Handle special case for single character answers
    if (normalizedStudent.length === 1 && normalizedCorrect.length === 1) {
        return normalizedStudent === normalizedCorrect;
    }

    // Short answer validation
    if (answerType === 'short') {
        // Check if student's answer contains the correct answer (in order)
        if (normalizedStudent.includes(normalizedCorrect)) {
            return true;
        }

        // Check if correct answer contains student's answer (in order)
        if (normalizedCorrect.includes(normalizedStudent)) {
            return true;
        }

        // Check if answers are similar (using Levenshtein distance)
        const maxDistance = Math.min(normalizedStudent.length, normalizedCorrect.length) * 0.3; // Allow up to 30% difference
        const distance = calculateLevenshteinDistance(normalizedStudent, normalizedCorrect);
        if (distance <= maxDistance) {
            return true;
        }

        // Check for common variations
        const variations = [
            // Common word order variations
            normalizedCorrect.split('').reverse().join(''),
            // Common misspellings
            normalizedCorrect.replace('th', 'the'),
            normalizedCorrect.replace('the', 'th'),
            normalizedCorrect.replace('ing', 'in'),
            normalizedCorrect.replace('in', 'ing'),
        ];

        // Check if any variation matches
        if (variations.some(variation => normalizedStudent === variation)) {
            return true;
        }

        return false;
    }

    // Long answer validation
    if (answerType === 'long') {
        // Check if student's answer contains the correct answer (in order)
        if (normalizedStudent.includes(normalizedCorrect)) {
            return true;
        }

        // Check if correct answer contains student's answer (in order)
        if (normalizedCorrect.includes(normalizedStudent)) {
            return true;
        }

        // Check if answers are similar (using Levenshtein distance)
        const maxDistance = Math.min(normalizedStudent.length, normalizedCorrect.length) * 0.2; // Allow up to 20% difference
        const distance = calculateLevenshteinDistance(normalizedStudent, normalizedCorrect);
        return distance <= maxDistance;
    }

    // Default to exact match for other types
    return normalizedStudent === normalizedCorrect;
}

function calculateLevenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    for (let i = 0; i <= b.length; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = b[i - 1] === a[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    return matrix[b.length][a.length];
}

// Export a helper function to check if an answer is a short answer
export function isShortAnswer(answer: string): boolean {
    const normalized = normalizeAnswer(answer);
    return normalized.length < 20; // Consider as short answer if less than 20 characters
}
