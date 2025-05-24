<?php

namespace App\Services;

use GuzzleHttp\Client;

class ActivityService
{
    public function getActivity()
    {
        $client = new Client();
        $response = $client->get('https://bored-api.appbrewery.com/random');
        $data = json_decode($response->getBody(), true);

        return $data;
    }
}
