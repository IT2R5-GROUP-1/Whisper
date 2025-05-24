<?php

namespace App\Services;

use GuzzleHttp\Client;

class JokeService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'https://icanhazdadjoke.com/',
            'headers' => [
                'Accept' => 'application/json',
                'User-Agent' => 'Lumen Joke App'
            ]
        ]);
    }

    public function getRandomJoke()
    {
        $response = $this->client->get('/');
        $body = json_decode($response->getBody(), true);
        return $body['joke'] ?? 'No joke found!';
    }
}
