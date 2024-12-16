const AIServicesSection = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [extractedData, setExtractedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const chatContainerRef = useRef(null);
  
    const documentTypes = [
      { value: 'SALARY', label: 'Salary Document' },
      { value: 'HOUSE_CONTRACT', label: 'House Contract' },
      { value: 'UTILITY_BILL', label: 'Utility Bill' },
      { value: 'SOCIAL_SECURITY', label: 'Social Security Document' },
      { value: 'JOB_CONTRACT', label: 'Job Contract' },
      { value: 'HEALTH_INSURANCE', label: 'Health Insurance' },
      { value: 'TAX_DOCUMENT', label: 'Tax Document' },
      { value: 'RESIDENCE_PERMIT', label: 'Residence Permit' },
    ];
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a PDF file');
        setSelectedFile(null);
      }
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!selectedFile || !documentType) {
        setError('Please select both a file and document type');
        return;
      }
  
      setLoading(true);
      setError(null);
  
  
      
      try {
        const response = await extractDocumentInfo1(selectedFile, documentType);
        setExtractedData(response.extracted_info);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    // Helper function to render extracted data as a table
    const renderExtractedData = (data) => {
      if (!data) return null;
  
      const renderValue = (value) => {
        if (typeof value === 'object' && value !== null) {
          return <pre>{JSON.stringify(value, null, 2)}</pre>;
        }
        return value;
      };
  
      return (
        <table className="extracted-data-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{renderValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };
  
    const handleQuestionSubmit = async (e) => {
      e.preventDefault();
      if (!selectedFile || !question.trim()) {
        setError('Please upload a file and enter a question');
        return;
      }
  
      setChatLoading(true);
      setError(null);
  
      try {
        const response = await askDocumentQuestion(selectedFile, question);
        setChatHistory(prev => [...prev, {
          question,
          answer: response.response.answer,
          confidence: response.response.confidence,
          relevantText: response.response.relevant_text
        }]);
        setQuestion('');
        
        // Scroll to bottom of chat
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setChatLoading(false);
      }
    };
  
    const renderChatMessage = (message, index) => (
      <div key={index} className="chat-message">
        <div className="question">
          <strong>Q:</strong> {message.question}
        </div>
        <div className="answer">
          <strong>A:</strong> {message.answer}
          <div className="confidence-level">
            Confidence: <span className={`confidence-${message.confidence}`}>
              {message.confidence}
            </span>
          </div>
          {message.relevantText && (
            <div className="relevant-text">
              <small>
                <strong>Relevant text:</strong> {message.relevantText}
              </small>
            </div>
          )}
        </div>
      </div>
    );
  
    return (
      <div className="ai-services-section">
        <div className="section-separator">
          <h2 className="separator-title">AI Document Analysis</h2>
        </div>
        
        <div className="ai-services-container">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="documentType">Document Type:</label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                required
              >
                <option value="">Select document type</option>
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="form-group">
              <label htmlFor="file">Upload PDF:</label>
              <input
                type="file"
                id="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </div>
  
            <button type="submit" disabled={loading || !selectedFile || !documentType}>
              {loading ? 'Processing...' : 'Analyze Document'}
            </button>
          </form>
  
          {error && <div className="error-message">{error}</div>}
          
          {extractedData && (
            <div className="results-container">
              <h3>Extracted Information</h3>
              {renderExtractedData(extractedData)}
            </div>
          )}
  
          {/* New Chat Interface */}
          <div className="chat-section">
            <h3>Ask Questions About Your Document</h3>
            <div className="chat-container" ref={chatContainerRef}>
              {chatHistory.map((message, index) => renderChatMessage(message, index))}
              {chatLoading && (
                <div className="chat-loading">
                  Processing your question...
                </div>
              )}
            </div>
            <form onSubmit={handleQuestionSubmit} className="chat-form">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your document..."
                disabled={!selectedFile || chatLoading}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={!selectedFile || !question.trim() || chatLoading}
                className="chat-submit"
              >
                {chatLoading ? 'Processing...' : 'Ask'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };