import { useMemo } from "react";

interface PasswordStrengthProps {
  password?: string;
}

const PasswordStrength = ({ password = "" }: PasswordStrengthProps) => {
  const getStrengthLevel = (pass: string): number => {
    let level = 0;
    if (!pass) return 0;

    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length > 0) level = 1;
    if (pass.length >= 8 && hasLetters && hasNumbers) level = 2;
    if (pass.length >= 8 && hasLetters && hasNumbers && hasSymbols) level = 3;
    if (pass.length >= 12 && hasLetters && hasNumbers && hasSymbols) level = 4;

    return level;
  };

  const strengthLevel = useMemo(() => getStrengthLevel(password), [password]);

  const strengthInfo = useMemo(() => {
    switch (strengthLevel) {
      case 1:
        return { label: "Weak", color: "bg-red-500" };
      case 2:
        return { label: "Medium", color: "bg-yellow-500" };
      case 3:
        return { label: "Strong", color: "bg-green-500" };
      case 4:
        return { label: "Very Strong", color: "bg-green-700" };
      default:
        return { label: "", color: "bg-gray-200" };
    }
  }, [strengthLevel]);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full ${
              i < strengthLevel ? strengthInfo.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      {strengthLevel > 0 && (
        <p className="text-xs text-muted-foreground">
          Password strength: {strengthInfo.label}
        </p>
      )}
    </div>
  );
};

export default PasswordStrength;