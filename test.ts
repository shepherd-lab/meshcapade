#!/usr/bin/env ts-node

const { Meshcapade } = require("./Meshcapade")

const testAll = async () => {
  const authorizationResponse = {
    message: "Login successful!",
    username: "SRLbodycomplab",
    token:
      "eyJraWQiOiJRbG96MDRyUVI1MGsrd1kreDdZRXBjU29xZVRSdkVKb1ZjdWRONnZRSDhjPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiSnNMc0pFb1J3MEpkcDFJMGtRTUZxQSIsInN1YiI6IjY5OGYxM2EwLTNhOGEtNDUxYS04NjIzLTJmMjhiMDEzYmFjNCIsImF1ZCI6IjdsbzAzNzd2c2EyZHUyY3FiNWRrbTM3OGNuIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV2ZW50X2lkIjoiYjgyYTM3MGEtMTNiNi00YzQ1LTg0ZWMtYWNkYjg5MzM0ODRjIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1ODI5MTg1NDYsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS1jZW50cmFsLTEuYW1hem9uYXdzLmNvbVwvZXUtY2VudHJhbC0xX2NlU0lxMmxTTCIsImNvZ25pdG86dXNlcm5hbWUiOiJTUkxib2R5Y29tcGxhYiIsImV4cCI6MTU4MjkyMjE0NiwiaWF0IjoxNTgyOTE4NTQ2LCJlbWFpbCI6ImpvaG5zaGVwQGhhd2FpaS5lZHUifQ.TmtCkmZpbIr0XJ8FspfMyyl1PrfLRvOCkG_tHK1hHjXyRM5MqXEYi2noP5XmmDmpqRaC3PAL0msPw1hNZkl-mN5D4PZLNhxAeStR8Jzx2ILI06GBNuMMtJnnENoeFFof-xY9f17E1HS6ZA6I9SaocDQO9zuq4-N2ypp-PN7cxPZcUDSKgU1r9UAPDzsHT5KAAiat1m5_snmBsASJV06NGI_iAJ73q1AuOn59zijmHODSJ90v685cSESiIH4lK8TaNWX0rJM8P9PlXwIncKn7gUq0BGxdGHUWzdwJga8KhMfDH-E5RniLcsHM11TZ28DCihtfFQ36y3Dz8WOckZs8iA",
    expires_in: 3600
  }

  const username = "SRLbodycomplab"
  const filePath = `meshes/uohtest.obj`
  const outPutFilePath = `meshes/uohtest-output.obj`
  const options = { gender: "female", input_units: "mm", input_hands: "fist", up_axis: "z", look_axis: "x", output_pose: "t", output_hands: "splay", resolution: "high" }

  const session = new Meshcapade(username, authorizationResponse.token, filePath)
  const result = await session.align(filePath, outPutFilePath, options)
}

testAll()
