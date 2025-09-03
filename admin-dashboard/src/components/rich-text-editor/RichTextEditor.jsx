import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Define the custom toolbar and formats
const modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' },
        { 'indent': '-1' }, { 'indent': '+1' }],
        ['link',],
        [{ 'code-block': true }],  // Code block feature
        ['clean']  // Clear formatting
    ],
    clipboard: {
        matchVisual: false,
    }
};

// Supported formats
const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link',
    'code-block'  // Code block format
];

const TextRichEditor = ({ value, onChange, placeholder }) => {
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            modules={modules}  // Pass the custom toolbar modules
            formats={formats}  // Pass the supported formats
        />
    );
};

export default TextRichEditor;
