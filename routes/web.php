<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->post('/posts', 'PostController@store');
$router->get('/posts', 'PostController@index');
$router->get('/posts/{id}', 'PostController@show');
$router->delete('/posts/{id}', 'PostController@destroy');

$router->post('/posts/{postId}/comments', 'CommentController@store');
$router->get('/posts/{postId}/comments', 'CommentController@getComments');
$router->post('/comments/{commentId}/reply', 'CommentController@reply');

$router->get('/joke', 'JokeController@getJoke');

$router->get('/trivia', 'TriviaController@getTrivia');

$router->get('/catfact', 'CatFactController@getCatFact');

$router->get('/activity', 'ActivityController@getActivity');

$router->get('/advice', 'AdviceController@randomAdvice');
