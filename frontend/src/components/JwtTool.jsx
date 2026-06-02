import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { apibaseurl, callApi } from '../lib';
import ProgressBar from './ProgressBar';

const JwtTool = () => {
    const navigate = useNavigate();
    const [field1, setField1] = useState('');
    const [field2, setField2] = useState('');
    const [field3, setField3] = useState('');
    const [generatedJwt, setGeneratedJwt] = useState('');
    const [tokenToValidate, setTokenToValidate] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [isProgress, setIsProgress] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    function handleGenerate() {
        setErrorMessage('');
        setValidationResult(null);
        if (!field1.trim() || !field2.trim() || !field3.trim()) {
            setErrorMessage('Enter all three input values before generating the JWT.');
            return;
        }
        setIsProgress(true);
        callApi('POST', apibaseurl + '/authservice/generate', {
            field1: field1.trim(),
            field2: field2.trim(),
            field3: field3.trim()
        }, null, (res) => {
            setIsProgress(false);
            if (res.code === 200 && res.jwt) {
                setGeneratedJwt(res.jwt);
            } else {
                setErrorMessage(res.message || 'Unable to generate JWT');
                setGeneratedJwt('');
            }
        });
    }

    function handleValidate() {
        setErrorMessage('');
        setValidationResult(null);
        if (!tokenToValidate.trim()) {
            setErrorMessage('Enter a JWT token to validate.');
            return;
        }
        setIsProgress(true);
        callApi('POST', apibaseurl + '/authservice/validate', {
            token: tokenToValidate.trim()
        }, null, (res) => {
            setIsProgress(false);
            if (res.code === 200 && res.payload) {
                setValidationResult(res.payload);
            } else {
                setErrorMessage(res.message || 'Invalid token or validation failed');
            }
        });
    }

    return (
        <div className='home'>
            <div className='home-header'>
                <img src='/logo.png' alt='' />
                <div className='info'>
                    JWT Token Generator
                    <img src='/shutdown.png' alt='Back' onClick={() => navigate(-1)} />
                </div>
            </div>
            <div className='home-workspace'>
                <div className='home-content' style={{ padding: '24px', minHeight: '520px' }}>
                    <section className='page-section'>
                        <h2>Generate JWT</h2>
                        <div className='form-row'>
                            <label>Value 1</label>
                            <input type='text' value={field1} onChange={(e) => setField1(e.target.value)} placeholder='Enter first value' />
                        </div>
                        <div className='form-row'>
                            <label>Value 2</label>
                            <input type='text' value={field2} onChange={(e) => setField2(e.target.value)} placeholder='Enter second value' />
                        </div>
                        <div className='form-row'>
                            <label>Value 3</label>
                            <input type='text' value={field3} onChange={(e) => setField3(e.target.value)} placeholder='Enter third value' />
                        </div>
                        <button type='button' onClick={handleGenerate}>Generate JWT</button>
                        {generatedJwt && (
                            <div className='jwt-output'>
                                <label>Generated JWT</label>
                                <textarea readOnly value={generatedJwt} rows={4} />
                            </div>
                        )}
                    </section>

                    <section className='page-section'>
                        <h2>Validate JWT</h2>
                        <div className='form-row'>
                            <label>Token</label>
                            <textarea value={tokenToValidate} onChange={(e) => setTokenToValidate(e.target.value)} rows={3} placeholder='Paste JWT to validate' />
                        </div>
                        <button type='button' onClick={handleValidate}>Validate Token</button>
                        {validationResult && (
                            <div className='jwt-output'>
                                <label>Validation Result</label>
                                <pre>{JSON.stringify(validationResult, null, 2)}</pre>
                            </div>
                        )}
                    </section>

                    {errorMessage && <div className='error-message'>{errorMessage}</div>}
                </div>
            </div>
            <div className='home-footer'>JWT tool page</div>
            <ProgressBar isProgress={isProgress} />
        </div>
    );
};

export default JwtTool;
