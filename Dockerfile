FROM 528451384384.dkr.ecr.us-west-2.amazonaws.com/segment-node:10.18 as builder
RUN apk add --update curl ca-certificates make git gcc g++ python
WORKDIR /app
COPY ./ /app
RUN yarn install
COPY . .
# Rebuild any native bindings that were copied over from CircleCI
RUN npm rebuild
# Use a multi stage build so that the packages required for compiling native bindings aren't in the final image
FROM 528451384384.dkr.ecr.us-west-2.amazonaws.com/segment-node:10.18 as builder
WORKDIR /app
# Output Node version info so we know exactly what version was used
RUN npm version
COPY --from=builder /app /app
# Create unprividged user to run as
RUN addgroup -g 1001 -S unprivilegeduser && adduser -u 1001 -S -G unprivilegeduser unprivilegeduser
RUN chown -R unprivilegeduser:unprivilegeduser /app
USER unprivilegeduser
EXPOSE 8765
CMD ["yarn", "dev"]
