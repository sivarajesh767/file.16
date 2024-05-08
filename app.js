const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()

const databasePath = path.join(__dirname, 'moviesData.db')
app.use(express.json())

let database = null
const initlizeDbReverse = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initlizeDbReverse()

const convertDbObjectToReverseDbObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
    *
    FROM
    movie;`

  const movieArray = await database.all(getMoviesQuery)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId, directorId, movieName, leadActor} = request.body

  const getMoviesQuery = `
SELECT
*
FROM
movie
WHERE
movie_id = ${movieId};`

  const movieArray = await database.get(getMoviesQuery)
  response.send(
    movieArray.map(eachArray => convertDbObjectToReverseDbObject(eachArray)),
  )
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT
  *
  FROM
    director;`

  const directorArray = await database.all(getDirectorsQuery)
  response.send(
    directorArray.map(eachDirector =>
      convertDbObjectToReverseDbObject(eachDirector),
    ),
  )
})

app.get('directors/:directorId/movies/', async (request, response) => {})

app.post('/movies/', async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMoviesQuery = `
  INSERT INTO
  movies(director_id, movie_name, lead_actor)
  VALUES
  ('${directorId}', '${movieName}', '${leadActor}');`

  const moviesArray = await database.run(postMoviesQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params

  const updatetMoviesQuery = `
  UPDATE
  movie
  SET
  director_id = '${directorId}',
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'

  WHERE
  movie_id = ${movieId};`

  await database.run(updatetMoviesQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMoviesQuery = `
  DELETE FROM
  movie

  WHERE
  movie_id = ${movieId};`

  await database.run(deleteMoviesQuery)
  response.send('Movie Removed')
})

module.exports = app
