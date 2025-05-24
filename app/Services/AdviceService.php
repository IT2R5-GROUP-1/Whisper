<?php

namespace App\Services;

use GuzzleHttp\Client;

class AdviceService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'https://api.adviceslip.com/',
            'timeout'  => 5,
        ]);
    }

    public function getRandomAdvice()
    {
        $response = $this->client->get('advice');
        $data = json_decode($response->getBody()->getContents(), true);

        return $data['slip']['advice'] ?? 'No advice available';
    }
}
