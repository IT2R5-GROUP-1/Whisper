<?php

return [
    'paths' => ['*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Or replace * with 'http://127.0.0.1:5500'
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
