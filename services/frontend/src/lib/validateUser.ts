interface ValidationResult {
    isValid: boolean;
    error: string | null;
}

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateUserInput = (email: string, firstName: string, lastName: string, groups: string[]): ValidationResult => {
    if (!validateEmail(email)) {
        return {
            isValid: false,
            error: 'Invalid email format.',
        };
    }

    if (firstName.trim() === '') {
        return {
            isValid: false,
            error: 'First name should not be empty.',
        };
    }

    if (firstName.length > 255) {
        return {
            isValid: false,
            error: 'First name should not exceed 255 characters.',
        };
    }

    if (lastName.trim() === '') {
        return {
            isValid: false,
            error: 'Last name should not be empty.',
        };
    }

    if (lastName.length > 255) {
        return {
            isValid: false,
            error: 'Last name should not exceed 255 characters.',
        };
    }

    if (groups && groups.length === 0) {
        return {
            isValid: false,
            error: 'User should in atleast one group.',
        };
    }

    return {
        isValid: true,
        error: null,
    };
};

export default validateUserInput;  