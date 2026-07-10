<?php
class GeminiAI {
    private $apiKey;
    private $model;
    private $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/";

    public function __construct($apiKey, $model = 'gemini-1.5-flash') {
        $this->apiKey = $apiKey;
        $this->model = !empty($model) ? $model : 'gemini-1.5-flash';
    }

    public function ask($prompt) {
        // Construct the URL using the manual model name from settings
        $url = $this->endpoint . $this->model . ":generateContent?key=" . $this->apiKey;
        
        $payload = [
            "contents" => [["parts" => [["text" => $prompt]]]]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        
        // Error handling if model name is wrong
        if (isset($data['error'])) {
            return "AI Error: " . $data['error']['message'];
        }

        return $data['candidates'][0]['content']['parts'][0]['text'] ?? "AI is thinking...";
    }
}
