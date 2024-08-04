"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeSummary = void 0;
var youtubei_js_1 = require("youtubei.js");
var generative_ai_1 = require("@google/generative-ai");
function getYouTubeSummary(url, numberOfPoints) {
    return __awaiter(this, void 0, void 0, function () {
        var MAX_RETRIES, retries, youtube, generateSummary, transcript, info, summary, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    MAX_RETRIES = 5;
                    retries = 0;
                    return [4 /*yield*/, youtubei_js_1.Innertube.create({
                            lang: 'en',
                        })];
                case 1:
                    youtube = _a.sent();
                    youtube.getInfo(url).then(console.log);
                    generateSummary = function (transcript, info) { return __awaiter(_this, void 0, void 0, function () {
                        var genAI, model, prompt_1, geminiResult, error_2;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.geminiapi) !== null && _a !== void 0 ? _a : '');
                                    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                                    prompt_1 = "\n\t\t\t  You are an ai assistant tasked with one task which is to summarize the transcript of this youtube video into ".concat(numberOfPoints, " informative and short messages that get all the details.\n\t\t\t\tthe messages should be concise and cover everything about the videos content and the subject itself not the videos structure.\n\t\t\t\tyou must be as good at story telling within the format as possible. avoid sounding dry at all cost. unless its a serious topic be professional.\n\t\t\t\tdon't refer to the video as \"the video\" you are here to talk about its content\n\t\t\t\tavoid repetition by using pronouns between messages.\n\t\t\t\tdo not mention the intro, outro or sponsorship. write the messages as only the text separated by new line characters. no symbol or anything else.\n\t\t\t  all these points should be only one sentence long.\n\t\t\t\tmostly speak in past tense mentioning the channel name sometimes without repeating names too much.\n\t\t\t\tspeak very very casually like a friend texting and with minimal punctuation without a dot at the end of messages.\n\t\t\t  for generally unsafe words, things that can get you censored use asterisks and hashes in the middle of the word like s#x and d*gs. keep everything clean of nsfw content\n\t\t\t\tvideo information use it for your commentary: ").concat(info, "\n\t\t\t  the video transcript: \n").concat(transcript, "\n\t\t\t").replace(/\s{2,}/g, ' ');
                                    // const prompt = `
                                    // 	You are a youtube content creator your job is to summarize content into short form from its transcript.
                                    // 	you receive a videos transcript and output the following format:
                                    // 		intro section should have something like "so charlie recently announced that he is retiring" or "things are heating up over in LA james is dissing out people left and right"
                                    // 		content section divided into exactly ${numberOfPoints} points separated by new lines that gets all the details from the video in a concise manner. each bullet point should be one line of text or one sentence
                                    // 		outro part with something like "i just saved precious minutes for you so why don't you hit that like button and subscribe for more content". they don't have to be exactly like this but always make sure to include a call for action
                                    // 	use pronouns to avoid repeating the same names too often between bullet points
                                    // 	talk about everything in the past tense and talk about the videos content not the structure itself so don't mention that there was some intro, outro or sponsorship
                                    // 	separate everything by new lines with no extra punctuation or anything to make it look like a list. even when the intro/outro get too long separate by new lines
                                    //   for generally unsafe words, things that can get you censored use asterisks and hashes in the middle of the word like s#x and d*gs. keep everything clean of nsfw content
                                    // 	video information use it for your commentary: ${info}
                                    // 	work with this transcript: ${transcript}
                                    // `.replace(/\s{2,}/g, ' ');
                                    console.log('prompting gemini..', { url: url });
                                    return [4 /*yield*/, model.generateContent(prompt_1)];
                                case 1:
                                    geminiResult = _b.sent();
                                    console.log('summary obtained', { url: url });
                                    return [2 /*return*/, geminiResult.response
                                            .text()
                                            .split('\n')
                                            .filter(function (point) { return point.length; })];
                                case 2:
                                    error_2 = _b.sent();
                                    console.error('Error generating summary:', error_2);
                                    throw error_2;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    _a.label = 2;
                case 2:
                    if (!(retries < MAX_RETRIES)) return [3 /*break*/, 10];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 7, , 9]);
                    return [4 /*yield*/, fetchTranscript()];
                case 4:
                    transcript = _a.sent();
                    return [4 /*yield*/, fetchInfo()];
                case 5:
                    info = _a.sent();
                    return [4 /*yield*/, generateSummary(transcript, info)];
                case 6:
                    summary = _a.sent();
                    return [2 /*return*/, summary];
                case 7:
                    error_1 = _a.sent();
                    retries++;
                    return [4 /*yield*/, new Promise(function (res) {
                            setTimeout(res, 5000);
                        })];
                case 8:
                    _a.sent();
                    console.warn("Attempt ".concat(retries, " failed. Retrying..."));
                    if (retries >= MAX_RETRIES) {
                        throw new Error("Failed to get YouTube summary after ".concat(MAX_RETRIES, " attempts."));
                    }
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 2];
                case 10: throw new Error('Unexpected error occurred.');
            }
        });
    });
}
exports.getYouTubeSummary = getYouTubeSummary;
// Example usage:
// getYouTubeSummary("https://www.youtube.com/watch?v=g8wZ85YWfas", 10)
//   .then((summary) => console.log(summary))
//   .catch((error) => console.error("Error:", error));
