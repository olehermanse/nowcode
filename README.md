# Nowcode

http://nowco.de

## Development server

Start the development server:
```
make run-server
```

For development purposes it defaults to port 5000:

http://127.0.0.1:5000

## Documentation

### Interactive docs

Interactive documentation is served on the `/api` route of the dev server:

http://127.0.0.1:5000/api

Flask, Flask RESTPlus, and Swagger UI is used to achieve this.

### Static docs

Spectacle can be used to generate static docs:
```
make docs
```

They can be found in the `docs` folder, but don't look as nice as the interactive Swagger UI documentation mentioned above.
