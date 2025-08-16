import React, { useState } from 'react';

const ApiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch('http://votesystemrami.tryasp.net/api/Auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: 'rami',
          password: '123'
        })
      });

      setTestResult(`Status: ${response.status}\nHeaders: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(prev => prev + `\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        setTestResult(prev => prev + `\n\nError: ${errorText}`);
      }
    } catch (error) {
      setTestResult(`Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      <p className="text-sm text-gray-600 mb-4">Testing with credentials: rami / 123</p>
      <button
        onClick={testApiConnection}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {testResult && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Test Result:</h4>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
