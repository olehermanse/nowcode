# Nowcode

Website:

https://nowco.de

### Run locally

With podman:

```
podman build --tag nowcode . && podman run -it -p 3000:3000 --name nowcode --rm nowcode
```

Or docker:

```
docker build --tag nowcode . && docker run -it -p 3000:3000 --name nowcode --rm nowcode
```

Open:

http://127.0.0.1:3000
