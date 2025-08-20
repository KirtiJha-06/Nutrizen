import React, { useState } from 'react';

const App = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'Sree', // Default name
    contact: '9876543210', // Default contact
    email: 'sree@example.com', // Default email
    country: 'India', // Default country
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevInfo => ({ ...prevInfo, [name]: value }));
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleFeedbackSubmit = () => {
    // In a real application, you would send feedback to a backend.
    if (feedback.trim() === '') {
      alert('Please enter your feedback before submitting.');
      return;
    }
    alert('Thank you for your valuable feedback!');
    setFeedback('');
  };

  const handleExportData = () => {
    alert('A copy of your data will be prepared and sent to your email.');
    // In a real application, this would trigger a data export process.
  };

  const handleDeleteAccount = () => {
    const confirmation = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmation) {
      alert('Your account has been deleted successfully.');
      // In a real application, this would delete the user's data and log them out.
    }
  };

  const handleLogout = () => {
    alert('You have been logged out.');
    // In a real application, you would handle user session termination.
  };

  return (
    <div className={`min-h-screen font-sans p-6 transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-50 to-pink-100'}`}>
      <div className={`w-full max-w-3xl mx-auto p-8 rounded-3xl shadow-xl transition-colors duration-500 ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-8">Settings</h1>
        
        {/* User Information Section */}
        <div className={`space-y-6 mb-8 p-6 rounded-2xl shadow-inner transition-colors duration-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-pink-600">Your Information</h2>
            <button
              onClick={handleToggleEdit}
              className="px-4 py-2 text-sm rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              style={{
                background: isEditing ? 'linear-gradient(to right, #ef4444, #dc2626)' : 'linear-gradient(to right, #8b5cf6, #ec4899)',
                color: 'white',
              }}
            >
              {isEditing ? 'Save' : 'Edit Profile'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(userInfo).map((key) => (
              <div key={key}>
                <label className="block text-gray-600 dark:text-gray-300 mb-1 capitalize">{key}</label>
                <input
                  type={key === 'email' ? 'email' : 'text'}
                  name={key}
                  value={userInfo[key]}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 rounded-xl border transition-colors duration-300 ${isEditing ? 'border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400' : 'border-gray-300'} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preferences Section */}
        <div className={`space-y-6 mb-8 p-6 rounded-2xl shadow-inner transition-colors duration-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className="text-2xl font-bold text-pink-600">Preferences</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Enable Notifications</span>
            <div
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${notificationsEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              ></span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Dark Mode</span>
            <div
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${darkMode ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}
              ></span>
            </div>
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div className={`space-y-4 mb-8 p-6 rounded-2xl shadow-inner transition-colors duration-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className="text-2xl font-bold text-pink-600">Data & Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Manage your personal data and account settings.
          </p>
          <button
            onClick={handleExportData}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg mb-4"
          >
            Export My Data
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Delete My Account
          </button>
        </div>

        {/* Give Feedback Section */}
        <div className={`space-y-4 mb-8 p-6 rounded-2xl shadow-inner transition-colors duration-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className="text-2xl font-bold text-pink-600">Give Feedback</h2>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className={`w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            rows="4"
            placeholder="Tell us what you think..."
          ></textarea>
          <button
            onClick={handleFeedbackSubmit}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Submit Feedback
          </button>
        </div>

        {/* About Us Section */}
        <div className={`space-y-4 mb-8 p-6 rounded-2xl shadow-inner transition-colors duration-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className="text-2xl font-bold text-pink-600">About Us</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Our Dashboard is designed to be your personal wellness companion. It gives you a clear overview of your health metrics, from nutrition and fitness to mental well-being. By integrating features like a food scanner, routine planner, and journal, we aim to provide a holistic approach to your health journey.
          </p>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;