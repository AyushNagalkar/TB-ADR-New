import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, logout, getTbProfile } from '../lib/api';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    doseReminders: true,
    checkInReminders: true,
    adrAlerts: true
  });
  const [allowCaregiver, setAllowCaregiver] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treatment, setTreatment] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [data, treatment] = await Promise.all([getProfile(), getTbProfile()]);
        if (data) {
          setProfileData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || ''
          });
        }
        setTreatment(treatment);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile(profileData);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl text-ink">Settings</h1>
        <p className="font-body text-sm text-ink/70">Manage your profile and preferences</p>
      </div>

      {error && (
        <div className="p-3 bg-bg border border-alert text-alert rounded font-body text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="font-body text-ink">Loading settings...</div>
      ) : (
        <>
          <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
            <h2 className="font-heading text-base text-ink border-b border-line pb-2">Personal details</h2>
            <div className="flex flex-col gap-5 mt-2">
              <Input 
                label="Full Name" 
                value={profileData.name} 
                onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
              />
              <Input 
                label="Email" 
                type="email" 
                value={profileData.email} 
                onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
              />
              <Input 
                label="Phone Number" 
                type="tel" 
                value={profileData.phone} 
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
              />
              <Button 
                variant="primary" 
                className="w-full sm:w-auto self-start mt-2" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
            <div className="flex justify-between items-center border-b border-line pb-2">
              <h2 className="font-heading text-base text-ink">Treatment details</h2>
              <Link to="/onboarding" className="text-sm font-body text-primary underline py-2">Edit regimen</Link>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <p className="font-body text-sm text-ink/80"><strong>Treatment center:</strong> {treatment?.treatment_center || 'Not provided'}</p>
              <p className="font-body text-sm text-ink/80"><strong>Start date:</strong> {treatment?.treatment_start_date || 'Not provided'}</p>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
            <h2 className="font-heading text-base text-ink border-b border-line pb-2">Language</h2>
            <div className="mt-2">
              <Select 
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi' }
                ]}
                value="en"
                onChange={() => {}}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
            <h2 className="font-heading text-base text-ink border-b border-line pb-2">Notifications</h2>
            <div className="flex flex-col gap-4 mt-2">
              <label className="flex items-center gap-3 font-body text-sm text-ink cursor-pointer p-2 -ml-2 rounded hover:bg-bg transition-colors">
                <input type="checkbox" className="w-5 h-5 border-line text-primary rounded" 
                  checked={notifications.doseReminders}
                  onChange={(e) => setNotifications({...notifications, doseReminders: e.target.checked})}
                />
                Dose reminders
              </label>
              <label className="flex items-center gap-3 font-body text-sm text-ink cursor-pointer p-2 -ml-2 rounded hover:bg-bg transition-colors">
                <input type="checkbox" className="w-5 h-5 border-line text-primary rounded" 
                  checked={notifications.checkInReminders}
                  onChange={(e) => setNotifications({...notifications, checkInReminders: e.target.checked})}
                />
                Check-in reminders
              </label>
              <label className="flex items-center gap-3 font-body text-sm text-ink cursor-pointer p-2 -ml-2 rounded hover:bg-bg transition-colors">
                <input type="checkbox" className="w-5 h-5 border-line text-primary rounded" 
                  checked={notifications.adrAlerts}
                  onChange={(e) => setNotifications({...notifications, adrAlerts: e.target.checked})}
                />
                ADR alerts
              </label>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
            <h2 className="font-heading text-base text-ink border-b border-line pb-2">Privacy</h2>
            <div className="flex flex-col gap-4 mt-2">
              <p className="font-body text-sm text-ink/80 leading-relaxed">
                Your health data is stored securely and is only shared with your designated healthcare providers.
              </p>
              <label className="flex items-center gap-3 font-body text-sm text-ink cursor-pointer p-2 -ml-2 rounded hover:bg-bg transition-colors">
                <input type="checkbox" className="w-5 h-5 border-line text-primary rounded" 
                  checked={allowCaregiver}
                  onChange={(e) => setAllowCaregiver(e.target.checked)}
                />
                Allow caregiver to view my health data
              </label>
              {allowCaregiver && (
                <div className="bg-bg p-4 rounded border border-line mt-2">
                  <p className="font-body text-sm text-ink font-medium">Caregiver contact</p>
                  <p className="font-body text-sm text-ink/80 mt-1">+91 9988776655</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
            <h2 className="font-heading text-base text-ink border-b border-line pb-2">Account</h2>
            <div className="flex flex-col gap-4 mt-2">
              <Button variant="outline" className="w-full h-12 text-ink border-line" onClick={handleSignOut}>Sign out</Button>
              <div className="pt-4 border-t border-line mt-2 flex flex-col gap-3">
                <p className="font-body text-xs text-critical">Warning: This action cannot be undone.</p>
                <Button className="w-full h-12 bg-critical text-surface hover:opacity-90 transition-opacity">Delete my data</Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
