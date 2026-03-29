import React from 'react';

const FAQ: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">What is this framework?</h2>
          <p>This framework is designed to help users quickly build and deploy web applications with integrated AI capabilities.</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">How do I get started?</h2>
          <p>You can get started by cloning the repository, installing dependencies, and following the documentation for initial setup.</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Where can I find documentation?</h2>
          <p>Comprehensive documentation is available on our official website and within the project's README file.</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">How do I report a bug?</h2>
          <p>Bugs can be reported through our GitHub issue tracker or by contacting our support team via the contact us page.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
