<?php

namespace App\Services;

use GuzzleHttp\Client;

class TriviaService
{
    public function getTrivia()
    {
        $client = new Client();
        $response = $client->get('https://opentdb.com/api.php?amount=1');
        $data = json_decode($response->getBody(), true);

        $trivia = $data['results'][0];

        return [
            'category' => $trivia['category'],
            'question' => html_entity_decode($trivia['question']),
            'answer' => html_entity_decode($trivia['correct_answer']),
            'difficulty' => $trivia['difficulty']
        ];
    }
}
