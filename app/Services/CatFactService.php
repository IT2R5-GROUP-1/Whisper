<?php

namespace App\Services;

use GuzzleHttp\Client;

class CatFactService
{
    public function getCatFact()
    {
        $client = new Client();
        $response = $client->get('https://catfact.ninja/fact');
        $data = json_decode($response->getBody(), true);

        return $data['fact'];
    }
}
