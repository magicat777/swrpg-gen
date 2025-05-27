import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../services/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { LegalBanner } from '../../components/layout/LegalBanner';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Must be a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.darkSide.background} 0%,
    ${({ theme }) => theme.colors.neutral.primary} 100%
  );
  padding: ${({ theme }) => theme.spacing.md};
`;

const RegisterCard = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.effects.shadow.lg};
  padding: ${({ theme }) => theme.spacing['3xl']};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error : theme.colors.neutral.border
  };
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.lightSide.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const GeneralError = styled.div`
  background-color: ${({ theme }) => theme.colors.error}20;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LoginPrompt = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.lightSide.primary};
  cursor: pointer;
  text-decoration: underline;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  &:hover {
    color: ${({ theme }) => theme.colors.lightSide.secondary};
  }
`;

const PasswordHint = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
  line-height: 1.4;
`;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const [registerError, setRegisterError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setRegisterError('');
      setIsLoading(true);
      
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      // Navigation will be handled by the useEffect hook
    } catch (error) {
      setRegisterError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <PageContainer>
      <RegisterCard>
        <Title>Join the Force</Title>
        <Subtitle>Create your Star Wars RPG Generator account</Subtitle>

        {registerError && <GeneralError>{registerError}</GeneralError>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              $hasError={!!errors.username}
              {...register('username')}
            />
            {errors.username && (
              <ErrorMessage>{errors.username.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              $hasError={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              $hasError={!!errors.password}
              {...register('password')}
            />
            <PasswordHint>
              Password must be at least 8 characters with uppercase, lowercase, and a number
            </PasswordHint>
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              $hasError={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
            )}
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<UserPlus size={20} />}
          >
            Create Account
          </Button>
        </Form>

        <LoginPrompt>
          Already have an account?{' '}
          <LoginLink onClick={handleLoginClick}>
            Sign in here
          </LoginLink>
        </LoginPrompt>
      </RegisterCard>
      <LegalBanner />
    </PageContainer>
  );
};

export default RegisterPage;