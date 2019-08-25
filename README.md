# Segment Mock

A Docker sidecar that mocks the [Segment Tracking API](https://api.segment.io) to capture and replay analytics calls during integration tests.

This mock is not considered 100% compatibile with Segment's Tracking API, however it will work for recent versions of all of Segment's libraries.

## API

This sidecar exposes most of the APIs as `api.segment.io`, plus the following endpoints:

| HTTP Verb | Endpoint | Description |
| --------- | -------- | ----------- |
| GET       | /health | Returns a 200 if the server is available. |
| GET       | /messages | Returns all received messages, and removes them from the internal log. |

> The above API is subject to change.

## Usage

```sh
# This will start the sidecar, listening on http://localhost:8765
$ yarn dev
```

### With Docker Compose

Alternatively, you can add this image to your `docker-compose.yml`:

```yml
version: "3"
services:
  snapshotter:
    image: "segment/mock:v0.0.2"
    healthcheck:
      test: "curl --silent --show-error --fail localhost:8765/health || exit 1"
      interval: 1s
      timeout: 1s
      retries: 10
    ports:
      - "8765:8765"
```

## Configuring Segment SDKs

You can update any of the following Segment SDKs to send API requests to this image during integration tests.

### analytics-node

```js
const analytics = new SegmentAnalytics('123456', {
  host: 'http://localhost:8765',
})
```

### analytics.js

```js
// This will download the analytics.js snippet via this sidecar, which will
// modify the analytics.js snippet to send API requests to this sidecar.
const ajsCDNSnippet = snippetFn({
  apiKey: '<write key>',
  host: 'localhost:8765',
}).replace('https', 'http')
```

### analytics-android

```java
// TODO!
```

### analytics-ios

```objc
SEGAnalyticsConfiguration *configuration = [SEGAnalyticsConfiguration configurationWithWriteKey:@"123456"];

// Customize the requestFactory to point at our sidecar container, which snapshots all analytics calls.
configuration.requestFactory = ^(NSURL *url) {
    NSURLComponents *components = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:NO];
    components.scheme = @"http";
    components.host = @"localhost";
    components.port = @8765;
    NSURL *transformedURL = components.URL;
    return [NSMutableURLRequest requestWithURL:transformedURL];
};

[SEGAnalytics setupWithConfiguration:configuration];
```

## Fetching Analytics Calls

To see the set of messages that were fired, you can use the `/messages` endpoint:

```sh
$ curl http://localhost:8765/messages
[{"event":"Hello World","type":"track"}]
```

## Examples

A handful of usage examples exist in the [`segmentio/typewriter`](https://github.com/segmentio/typewriter/tree/v7.0.0/tests/e2e) repo.

## Releasing to DockerHub

This image is published to [DockerHub](https://cloud.docker.com/u/segment/repository/docker/segment/mock/general). You can build and publish new images from `master` like so:

```sh
# First, bump the version in the Makefile, per semver.
# Build the image:
$ yarn build
# Open a PR and merge it to master.
# Then, after checking out the master branch, run the following to publish to DockerHub:
$ yarn release
```
