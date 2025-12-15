
const StrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function isStrongPassword(password: string): boolean {
    return StrongPassword.test(password);
}