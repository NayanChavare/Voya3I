import React from 'react';

const ContactUs: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="space-y-4">
        <p>If you have any questions, feedback, or need assistance, please feel free to reach out to us using the information below:</p>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Email</h2>
          <p>For general inquiries and support, please email us at: <a href="mailto:support@example.com" className="text-blue-500">support@example.com</a></p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Hotline</h2>
          <p>You can reach us by phone at: <a href="tel:+919354507270" className="text-blue-500">+91 9354507270</a></p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Global HQ</h2>
          <p>K.R. Mangalam University, Gurugram, Haryana, India</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
