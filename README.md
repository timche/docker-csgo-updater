# docker-csgo-updater

<p>
  <a href="https://github.com/timche/docker-csgo-updater">
    <img alt="GitHub CI" src="https://github.com/timche/docker-csgo-updater/workflows/ci/badge.svg" />
  </a>
  <a href="https://hub.docker.com/r/timche/csgo-updater">
    <img alt="Docker Image Version (latest semver)" src="https://img.shields.io/docker/v/timche/csgo-updater" />
  </a>
  <a href="https://hub.docker.com/r/timche/csgo-updater">
    <img alt="Docker Image Size (latest semver)" src="https://img.shields.io/docker/image-size/timche/csgo-updater" />
  </a>
  <a href="https://hub.docker.com/r/timche/csgo-updater">
    <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/timche/csgo-updater" />
  </a>
  <a href="https://hub.docker.com/r/timche/csgo-updater">
    <img alt="Docker Stars" src="https://img.shields.io/docker/stars/timche/csgo-updater" />
  </a>
</p>

> Automatically update Counter-Strike: Global Offensive (CS:GO) Dedicated Servers running in [timche/csgo](https://github.com/timche/docker-csgo) image containers

## How to Use This Image

```
$ docker run -d \
  --name csgo-updater \
  -v /var/run/docker.sock:/var/run/docker.sock \
  timche/csgo-updater
```

More advanced usage and how it works can be found below.

## Environment Variables

##### `UPDATER_CONTAINER_IMAGE`

Default: `timche/csgo`

The Docker containers running the specified image name csgo-updater will watch.

##### `UPDATER_POLL_INTERVAL`

Default: `60`

The poll interval (in seconds) csgo-updater will poll for new containers.

## How It Works

csgo-updater is attaching to the stdout of the containers and will restart them when their CS:GO server process is logging `MasterRequestRestart`, which is a request from the Steam Master Server to tell the CS:GO server that an update is available and the server should restart.

To restart, csgo-updater will send `SIGINT` to the container, which is not immediately killing the CS:GO server process but instead the process will check if the server is empty or will wait for the server to be empty and then shut it down which will also stop the container. After that, csgo-updater will start the container again and [the CS:GO server will be updated before starting the server](https://github.com/timche/docker-csgo#updating-the-server).

**Note:** If the CS:GO server container has a restart policy set, the policy won't restart the container in this case, because csgo-updater is stopping the container manually. See [Docker restart policy details](https://docs.docker.com/config/containers/start-containers-automatically/#restart-policy-details).
