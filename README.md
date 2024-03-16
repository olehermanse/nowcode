# Nowcode

https://nowco.de

## Development server

Start the development server:

```
npm run dev-server
```

For development purposes it defaults to port 3000:

http://127.0.0.1:3000

## Containers

### docker

```
docker build --tag nowcode . && docker run -it -p 3000:3000 --name nowcode --rm nowcode
```

http://127.0.0.1:3000
