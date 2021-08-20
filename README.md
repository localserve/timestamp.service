# timestamp.service

A typescript, nodejs, postgres write-heavy, cache-less simple timestamp service.

You send `app` and `what` and it stores it. It is a good debugging/auditing service.

```shell

# POST data

curl -d "app=curl&what=curl is the best" -X POST  http://localhost:54083/ts
# {"success":true,"requestid":"96d7e6794c0f463ef5ca3c25dd585414643a4acd9e4e67faf267c4d2a12f1011"}

# GET

curl http://localhost:54083/ts | python -mjson.tool 
# {
#    "success": true,
#    "timestamps": [
#        {
#            "id": "15",
#            "app": "curl",
#            "what": "curl is the best",
#            "ts": "2021-08-20T01:55:34.350Z",
#            "requestid": "96d7e6794c0f463ef5ca3c25dd585414643a4acd9e4e67faf267c4d2a12f1011"
#        },
#    ]
# }
#

```
