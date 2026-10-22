import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { login, signup } from '../lib/api';

export const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showCaregiver, setShowCaregiver] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverContact, setCaregiverContact] = useState('');
  
  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'signup');
    // Clear errors when switching modes
    setError(null);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        // Send both caregiver name and contact if needed, but api expects caregiver_contact
        // We will combine them or just send what is requested
        await signup({ 
          name, 
          email, 
          phone, 
          password, 
          language, 
          caregiver_contact: caregiverContact 
        });
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-ink">
      <div className="max-w-md w-full flex flex-col gap-6">
        <Link to="/" className="text-primary hover:underline font-body text-sm self-start">
          ← Back to Welcome
        </Link>
        
        <Card className="p-8 flex flex-col gap-6">
          <h2 className="font-heading text-2xl text-primary font-semibold">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-alert/10 border border-alert text-alert rounded text-sm font-body">
                {error}
              </div>
            )}

            {!isLogin && (
              <Input 
                label="Name" 
                placeholder="Your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            )}
            
            <Input 
              label="Email" 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            {!isLogin && (
              <Input 
                label="Phone" 
                type="tel" 
                placeholder="Your phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            )}
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            
            {!isLogin && (
              <Select 
                label="Language preference" 
                options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }]} 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required 
              />
            )}

            {!isLogin && (
              <div className="border border-line p-4 mt-2 bg-surface">
                <button 
                  type="button" 
                  onClick={() => setShowCaregiver(!showCaregiver)}
                  className="w-full text-left font-body font-medium text-ink flex justify-between items-center"
                >
                  Caregiver details (optional)
                  <span>{showCaregiver ? '−' : '+'}</span>
                </button>
                
                {showCaregiver && (
                  <div className="flex flex-col gap-4 mt-4">
                    <Input 
                      label="Caregiver name" 
                      placeholder="Name of your caregiver" 
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                    />
                    <Input 
                      label="Caregiver phone" 
                      type="tel" 
                      placeholder="Phone number" 
                      value={caregiverContact}
                      onChange={(e) => setCaregiverContact(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
            </Button>
          </form>
          
          <div className="text-center mt-2">
            <button onClick={toggleMode} className="text-primary font-body text-sm hover:underline" type="button">
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
