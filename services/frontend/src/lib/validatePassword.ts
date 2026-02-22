const validatePassword = (password: string): boolean => {
  const lengthRegex = /^.{7,8}$/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  return (
    lengthRegex.test(password) &&
    uppercaseRegex.test(password) &&
    lowercaseRegex.test(password) &&
    specialCharRegex.test(password)
  );
};

export default validatePassword;
