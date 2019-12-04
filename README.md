# docker-csgo-updater

> Automatically restart [timche/csgo](https://github.com/timche/docker-csgo) based containers when a CS:GO server update is available

## How to Use This Image

```
$ docker run -d \
  --name csgo-updater \
  -v /var/run/docker.sock:/var/run/docker.sock \
  timche/csgo-updater
```
