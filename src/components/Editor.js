import React, { Component } from 'react';
import { geminiAPI } from '../services/geminiAPI';
import './Editor.css';

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: '',
            outputText: '',
            mode: 'simple', // default mode
            error: null,
        };
    }

    handleInputChange = (event) => {
        this.setState({ inputText: event.target.value });
    };

    handleModeChange = (event) => {
        this.setState({ mode: event.target.value });
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        const { inputText, mode } = this.state;

        try {
            const result = await geminiAPI.paraphrase(inputText, mode);
            this.setState({ outputText: result });
        } catch (error) {
            this.setState({ error: 'Error processing your request. Please try again.' });
        }
    };

    render() {
        const { inputText, outputText, error } = this.state;

        return (
            <div className="editor-container">
                <h1>AI Writing Assistant</h1>
                <form onSubmit={this.handleSubmit}>
                    <textarea
                        value={inputText}
                        onChange={this.handleInputChange}
                        placeholder="Type your text here..."
                        rows="10"
                        cols="50"
                    />
                    <select onChange={this.handleModeChange}>
                        <option value="simple">Simple</option>
                        <option value="formal">Formal</option>
                        <option value="academic">Academic</option>
                        <option value="creative">Creative</option>
                        <option value="shorten">Shorten</option>
                        <option value="expand">Expand</option>
                        <option value="custom">Custom</option>
                    </select>
                    <button type="submit">Paraphrase</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <h2>Output:</h2>
                <textarea
                    value={outputText}
                    readOnly
                    rows="10"
                    cols="50"
                />
            </div>
        );
    }
}

export default Editor;