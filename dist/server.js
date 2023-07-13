"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const abort_controller_1 = require("abort-controller");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3005;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Reference to the ongoing request and its controller
let currentRequest = null;
let currentController = null;
// Routes
app.post('/search', (req, res) => {
    const searchEmail = req.body.email || '';
    const searchNumber = req.body.number || '';
    // Cancel the previous request if it is still ongoing
    if (currentController) {
        currentController.abort();
        console.log('Previous request canceled');
    }
    // Create a new AbortController for the current request
    const controller = new abort_controller_1.AbortController();
    // Store the current request and its controller
    currentRequest = req;
    currentController = controller;
    // Delay the request processing
    setTimeout(() => {
        // Check if the request is still active
        if (currentRequest === req) {
            fs_1.default.readFile('data.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    currentRequest = null;
                    currentController = null;
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                try {
                    const jsonData = JSON.parse(data);
                    const matchingData = jsonData.filter((entry) => {
                        const emailMatch = entry.email.toLowerCase().includes(searchEmail.toLowerCase());
                        const numberMatch = entry.number.includes(searchNumber);
                        return emailMatch && numberMatch;
                    });
                    currentRequest = null;
                    currentController = null;
                    res.json(matchingData);
                }
                catch (error) {
                    console.error(error);
                    currentRequest = null;
                    currentController = null;
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            });
        }
    }, 5000);
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
